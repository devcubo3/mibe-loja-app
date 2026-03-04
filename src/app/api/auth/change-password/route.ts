import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();

    const { userId } = auth;
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Nova senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verificar senha atual tentando fazer login
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 400 }
      );
    }

    // Atualizar senha via admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
