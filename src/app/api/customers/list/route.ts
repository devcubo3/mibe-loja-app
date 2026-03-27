import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId, supabase } = auth;
        const searchParams = request.nextUrl.searchParams;

        const search = searchParams.get('search') || '';
        const sortBy = searchParams.get('sortBy') || 'recent';
        const page = parseInt(searchParams.get('page') || '0', 10);
        const pageSize = 20;

        // Usar admin para queries com join em profiles (RLS bloquearia perfis de outros usuários)
        const admin = getSupabaseAdmin();
        let query = admin
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
      `, { count: 'exact' })
            .eq('company_id', companyId);

        switch (sortBy) {
            case 'recent':
                query = query.order('last_purchase_date', { ascending: false, nullsFirst: false });
                break;
            case 'oldest':
                query = query.order('last_purchase_date', { ascending: true, nullsFirst: true });
                break;
            case 'highest_balance':
                query = query.order('current_balance', { ascending: false });
                break;
            default:
                query = query.order('last_purchase_date', { ascending: false, nullsFirst: false });
        }

        query = query.range(page * pageSize, (page + 1) * pageSize - 1);

        const { data: balancesData, error: queryError, count } = await query;

        if (queryError) throw queryError;

        // Buscar estatísticas de transações para cada cliente
        const customerIds = balancesData?.map((b: any) => b.user_id).filter(Boolean) || [];
        let transactionStats: Record<string, { total_purchases: number; total_spent: number; total_cashback: number }> = {};

        if (customerIds.length > 0) {
            const { data: transactions } = await admin
                .from('transactions')
                .select('user_id, total_amount, cashback_earned')
                .eq('company_id', companyId)
                .in('user_id', customerIds);

            transactions?.forEach((t) => {
                if (!t.user_id) return;
                if (!transactionStats[t.user_id]) {
                    transactionStats[t.user_id] = { total_purchases: 0, total_spent: 0, total_cashback: 0 };
                }
                transactionStats[t.user_id].total_purchases += 1;
                transactionStats[t.user_id].total_spent += t.total_amount || 0;
                transactionStats[t.user_id].total_cashback += t.cashback_earned || 0;
            });
        }

        return NextResponse.json({
            data: balancesData || [],
            count: count || 0,
            transactionStats
        });
    } catch (error) {
        console.error('Erro interno ao buscar lista de clientes:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
