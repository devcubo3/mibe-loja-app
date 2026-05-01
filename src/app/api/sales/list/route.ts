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

        const type = searchParams.get('type') || 'all';
        const period = searchParams.get('period') || 'month';
        const sortBy = searchParams.get('sortBy') || 'recent';
        const page = parseInt(searchParams.get('page') || '0', 10);
        const pageSize = 20;

        let query = supabaseAdmin
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
          phone,
          created_at,
          avatar_url
        )
      `, { count: 'exact' })
            .eq('company_id', companyId);

        const now = new Date();

        if (period === 'day') {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            query = query.gte('created_at', todayStart);
        } else if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            query = query.gte('created_at', weekAgo);
        } else if (period === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            query = query.gte('created_at', monthAgo);
        }

        if (type === 'with_cashback') {
            query = query.gt('cashback_redeemed', 0);
        } else if (type === 'without_cashback') {
            query = query.eq('cashback_redeemed', 0);
        }

        switch (sortBy) {
            case 'recent':
                query = query.order('created_at', { ascending: false });
                break;
            case 'oldest':
                query = query.order('created_at', { ascending: true });
                break;
            case 'highest':
                query = query.order('total_amount', { ascending: false });
                break;
            case 'lowest':
                query = query.order('total_amount', { ascending: true });
                break;
        }

        query = query.range(page * pageSize, (page + 1) * pageSize - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return NextResponse.json({
            data: data || [],
            count: count || 0
        });
    } catch (error) {
        console.error('Erro interno ao buscar lista de vendas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
