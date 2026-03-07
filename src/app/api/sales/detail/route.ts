import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId, supabase } = auth;
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID da venda é obrigatório' }, { status: 400 });
        }

        const { data, error } = await supabase
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
            .eq('id', id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Erro interno ao buscar detalhe da venda:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
