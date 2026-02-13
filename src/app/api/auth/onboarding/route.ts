import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Decodificar token
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

    const { error } = await supabase
      .from('company_users')
      .update({ onboarding_completed: true })
      .eq('id', tokenData.userId);

    if (error) {
      console.error('Erro ao atualizar onboarding:', error);
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no onboarding:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
