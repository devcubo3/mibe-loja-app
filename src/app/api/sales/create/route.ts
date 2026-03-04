import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();

    const { companyId } = auth;
    const supabaseAdmin = getSupabaseAdmin();

    // Validar body
    const body = await request.json();
    const { user_id, total_amount, cashback_redeemed, net_amount_paid, cashback_earned } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'ID do cliente é obrigatório' }, { status: 400 });
    }

    if (typeof total_amount !== 'number' || total_amount <= 0) {
      return NextResponse.json({ error: 'Valor total inválido' }, { status: 400 });
    }

    if (typeof net_amount_paid !== 'number' || net_amount_paid < 0) {
      return NextResponse.json({ error: 'Valor pago inválido' }, { status: 400 });
    }

    if (typeof cashback_earned !== 'number' || cashback_earned < 0) {
      return NextResponse.json({ error: 'Valor de cashback inválido' }, { status: 400 });
    }

    // Inserir transação com admin client (bypassa RLS)
    const { data: newSale, error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert({
        company_id: companyId,
        user_id,
        total_amount,
        cashback_redeemed: cashback_redeemed || 0,
        net_amount_paid,
        cashback_earned,
      })
      .select(`
        id,
        company_id,
        user_id,
        total_amount,
        cashback_redeemed,
        net_amount_paid,
        cashback_earned,
        admin_fee_amount,
        created_at,
        profiles:user_id (
          id,
          full_name,
          cpf,
          phone,
          birth_date,
          created_at,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Erro ao inserir transação:', insertError);
      return NextResponse.json(
        { error: 'Erro ao registrar venda' },
        { status: 500 }
      );
    }

    // Formatar resposta no formato SaleWithCustomer
    const sale = {
      id: newSale.id,
      company_id: newSale.company_id,
      user_id: newSale.user_id,
      total_amount: newSale.total_amount,
      cashback_redeemed: (newSale as any).cashback_redeemed || 0,
      net_amount_paid: newSale.net_amount_paid,
      cashback_earned: newSale.cashback_earned,
      admin_fee_amount: newSale.admin_fee_amount,
      created_at: newSale.created_at,
      customer: (newSale as any).profiles
        ? {
            id: (newSale as any).profiles.id,
            full_name: (newSale as any).profiles.full_name,
            cpf: (newSale as any).profiles.cpf,
            phone: (newSale as any).profiles.phone,
            birth_date: (newSale as any).profiles.birth_date,
            created_at: (newSale as any).profiles.created_at,
            avatar_url: (newSale as any).profiles.avatar_url,
          }
        : null,
    };

    return NextResponse.json({ success: true, sale });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
