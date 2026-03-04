import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabaseAdmin = getSupabaseAdmin();

    // Verificar se o email existe no auth.users
    const { data: emailExists, error: queryError } = await supabaseAdmin
      .rpc('check_email_exists', { email_input: normalizedEmail });

    if (queryError) {
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    if (!emailExists) {
      return NextResponse.json(
        { error: 'E-mail não cadastrado no sistema' },
        { status: 400 }
      );
    }

    // Email existe - enviar reset
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo }
    );

    if (resetError) {
      return NextResponse.json(
        { error: resetError.message || 'Erro ao enviar e-mail de recuperação' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
