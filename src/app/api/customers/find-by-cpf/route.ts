import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId, supabase } = auth;
        const searchParams = request.nextUrl.searchParams;
        let cpf = searchParams.get('cpf');

        if (!cpf) {
            return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 });
        }

        // Limpar CPF
        cpf = cpf.replace(/[.-]/g, '');

        // Buscar profile pelo CPF
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, cpf, phone, birth_date, created_at, avatar_url')
            .eq('cpf', cpf)
            .maybeSingle();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Cliente não encontrado com este CPF' }, { status: 404 });
        }

        // Buscar saldo do cliente nesta empresa
        const { data: balance } = await supabase
            .from('cashback_balances')
            .select('current_balance, last_purchase_date')
            .eq('company_id', companyId)
            .eq('user_id', profile.id)
            .maybeSingle();

        // Buscar estatísticas de transações
        const { data: transactions } = await supabase
            .from('transactions')
            .select('total_amount, cashback_earned')
            .eq('company_id', companyId)
            .eq('user_id', profile.id);

        return NextResponse.json({
            profile,
            balance,
            transactions: transactions || []
        });

    } catch (error) {
        console.error('Erro interno ao buscar cliente por CPF:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
