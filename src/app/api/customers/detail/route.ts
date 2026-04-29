import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId } = auth;
        const supabaseAdmin = getSupabaseAdmin();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID do cliente é obrigatório' }, { status: 400 });
        }

        // Buscar saldo do cliente
        const { data: balance, error: balanceError } = await supabaseAdmin
            .from('cashback_balances')
            .select(`
        id,
        user_id,
        company_id,
        current_balance,
        last_purchase_date,
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
            .eq('company_id', companyId)
            .eq('user_id', id)
            .single();

        if (balanceError || !balance || !(balance as any).profiles) {
            // Cliente pode não ter saldo ainda, buscar só o profile
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name, cpf, phone, birth_date, created_at, avatar_url')
                .eq('id', id)
                .single();

            if (profileError || !profile) {
                return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
            }

            return NextResponse.json({
                balance: null,
                profile,
                transactions: []
            });
        }

        // Buscar estatísticas de transações
        const { data: transactions } = await supabaseAdmin
            .from('transactions')
            .select('total_amount, cashback_earned')
            .eq('company_id', companyId)
            .eq('user_id', id);

        return NextResponse.json({
            balance,
            profile: (balance as any).profiles,
            transactions: transactions || []
        });
    } catch (error) {
        console.error('Erro interno ao buscar cliente:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
