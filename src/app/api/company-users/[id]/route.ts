import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, requireOwner, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

async function ensureStaffBelongsToCompany(staffId: string, companyId: string) {
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, company_id')
    .eq('id', staffId)
    .single();

  if (!profile) return { ok: false as const, status: 404, message: 'Funcionário não encontrado' };
  if (profile.role !== 'company_staff' || profile.company_id !== companyId) {
    return { ok: false as const, status: 403, message: 'Funcionário não pertence a esta empresa' };
  }
  return { ok: true as const };
}

// PATCH /api/company-users/[id] — atualiza nome/email/senha/is_active
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateAuth(request);
  if (auth instanceof AuthError) return auth.toResponse();
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck.toResponse();

  const { id } = await params;
  const guard = await ensureStaffBelongsToCompany(id, auth.companyId);
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const body = await request.json().catch(() => null) as
    | { name?: string; email?: string; password?: string; is_active?: boolean }
    | null;

  if (!body) return NextResponse.json({ error: 'Body inválido' }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const { data: { user: currentAuthUser } } = await supabase.auth.admin.getUserById(id);

  const authUpdates: { email?: string; password?: string } = {};
  if (body.email && body.email !== currentAuthUser?.email) {
    authUpdates.email = body.email;
  }
  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 });
    }
    authUpdates.password = body.password;
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error } = await supabase.auth.admin.updateUserById(id, authUpdates);
    if (error) {
      const isDup = error.message?.toLowerCase().includes('already');
      return NextResponse.json(
        { error: isDup ? 'Já existe um usuário com este email' : error.message },
        { status: isDup ? 409 : 500 },
      );
    }
  }

  const profileUpdates: { full_name?: string; is_active?: boolean } = {};
  if (body.name !== undefined) profileUpdates.full_name = body.name;
  if (body.is_active !== undefined) profileUpdates.is_active = body.is_active;

  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', id);
    if (error) {
      console.error('Error updating staff profile:', error);
      return NextResponse.json({ error: 'Erro ao atualizar funcionário' }, { status: 500 });
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, company_id, is_active, created_at')
    .eq('id', id)
    .single();

  const finalEmail = authUpdates.email ?? currentAuthUser?.email ?? '';

  return NextResponse.json({
    user: {
      id: profile?.id,
      name: profile?.full_name,
      email: finalEmail,
      company_id: profile?.company_id,
      is_active: profile?.is_active,
      created_at: profile?.created_at,
    },
  });
}

// DELETE /api/company-users/[id] — exclui funcionário
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateAuth(_request);
  if (auth instanceof AuthError) return auth.toResponse();
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck.toResponse();

  const { id } = await params;
  const guard = await ensureStaffBelongsToCompany(id, auth.companyId);
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Erro ao excluir funcionário' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
