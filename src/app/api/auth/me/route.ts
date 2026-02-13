import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    let tokenData: { userId: string; companyId: string; exp: number };
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    if (tokenData.exp < Date.now()) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from('company_users')
      .select('id, name, email, company_id, onboarding_completed, created_at, updated_at')
      .eq('id', tokenData.userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company_id: user.company_id,
        onboarding_completed: user.onboarding_completed || false,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
