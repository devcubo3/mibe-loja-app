import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, requireOwner, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET /api/company-users — lista staff da própria empresa (owner-only)
export async function GET(request: NextRequest) {
  const auth = await validateAuth(request);
  if (auth instanceof AuthError) return auth.toResponse();
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck.toResponse();

  const supabase = getSupabaseAdmin();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, company_id, is_active, created_at')
    .eq('company_id', auth.companyId)
    .eq('role', 'company_staff')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing staff:', error);
    return NextResponse.json({ error: 'Erro ao carregar usuários' }, { status: 500 });
  }

  // Buscar emails de auth.users em paralelo (escala com N_staff, não N_total)
  const userResults = await Promise.all(
    profiles.map((p) => supabase.auth.admin.getUserById(p.id)),
  );

  const staff = profiles.map((p, idx) => ({
    id: p.id,
    name: p.full_name,
    email: userResults[idx].data?.user?.email || '',
    company_id: p.company_id,
    is_active: p.is_active,
    created_at: p.created_at,
  }));

  return NextResponse.json({ users: staff });
}

// POST /api/company-users — cria staff (owner-only)
export async function POST(request: NextRequest) {
  const auth = await validateAuth(request);
  if (auth instanceof AuthError) return auth.toResponse();
  const ownerCheck = requireOwner(auth);
  if (ownerCheck) return ownerCheck.toResponse();

  const body = await request.json().catch(() => null) as
    | { name?: string; email?: string; password?: string }
    | null;

  if (!body?.name || !body.email || !body.password) {
    return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
  }
  if (body.password.length < 6) {
    return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.name },
  });

  if (createError || !created?.user) {
    const isDup = createError?.message?.toLowerCase().includes('already');
    return NextResponse.json(
      { error: isDup ? 'Já existe um usuário com este email' : (createError?.message || 'Erro ao criar usuário') },
      { status: isDup ? 409 : 500 },
    );
  }

  const userId = created.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: body.name,
      role: 'company_staff',
      company_id: auth.companyId,
      is_active: true,
    })
    .select('id, full_name, company_id, is_active, created_at')
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    console.error('Error creating staff profile:', profileError);
    return NextResponse.json({ error: 'Erro ao criar perfil do funcionário' }, { status: 500 });
  }

  return NextResponse.json({
    user: {
      id: profile.id,
      name: profile.full_name,
      email: body.email,
      company_id: profile.company_id,
      is_active: profile.is_active,
      created_at: profile.created_at,
    },
  });
}
