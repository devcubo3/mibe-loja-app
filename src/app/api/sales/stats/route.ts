import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId } = auth;
        const supabaseAdmin = getSupabaseAdmin();

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
        const yesterdayEnd = todayStart;

        // Buscar vendas de hoje
        const { data: todaySales, error: todayError } = await supabaseAdmin
            .from('transactions')
            .select('total_amount, net_amount_paid, cashback_earned')
            .eq('company_id', companyId)
            .gte('created_at', todayStart);

        if (todayError) throw todayError;

        // Buscar vendas de ontem
        const { data: yesterdaySales, error: yesterdayError } = await supabaseAdmin
            .from('transactions')
            .select('total_amount, net_amount_paid, cashback_earned')
            .eq('company_id', companyId)
            .gte('created_at', yesterdayStart)
            .lt('created_at', yesterdayEnd);

        if (yesterdayError) throw yesterdayError;

        // Buscar vendas recentes com dados do cliente
        const { data: recentTransactions, error: recentError } = await supabaseAdmin
            .from('transactions')
            .select(`
        id,
        company_id,
        user_id,
        total_amount,
        cashback_redeemed,
        net_amount_paid,
        cashback_earned,
        admin_fee_amount,
        payment_method,
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
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentError) throw recentError;

        return NextResponse.json({
            todaySales: todaySales || [],
            yesterdaySales: yesterdaySales || [],
            recentTransactions: recentTransactions || []
        });
    } catch (error) {
        console.error('Erro interno ao buscar estatísticas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
