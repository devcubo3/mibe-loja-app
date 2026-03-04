import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', auth.userId);

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
