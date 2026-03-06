import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId } = auth;
        const body = await request.json();
        const { reviewId, text } = body;

        if (!reviewId || !text) {
            return NextResponse.json({ error: 'reviewId e text são obrigatórios' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Atualiza a resposta confirmando que o review pertence à loja
        const { data, error } = await supabaseAdmin
            .from('reviews')
            .update({ owner_response: text })
            .eq('id', reviewId)
            .eq('company_id', companyId)
            .select()
            .single();

        if (error) {
            console.error('Erro ao responder avaliação:', error);
            return NextResponse.json({ error: 'Erro ao salvar resposta' }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Avaliação não encontrada ou não pertence a esta empresa' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro interno ao responder avaliação:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
