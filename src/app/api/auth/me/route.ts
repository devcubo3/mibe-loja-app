import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();

    const { userId, companyId, role } = auth;
    const supabase = getSupabaseAdmin();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, onboarding_completed, created_at')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);

    return NextResponse.json({
      user: {
        id: profile.id,
        name: profile.full_name,
        email: authUser?.email || '',
        company_id: companyId,
        role,
        onboarding_completed: profile.onboarding_completed || false,
        created_at: profile.created_at,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
