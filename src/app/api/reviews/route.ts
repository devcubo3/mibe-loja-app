import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId } = auth;
        const supabaseAdmin = getSupabaseAdmin();

        const { data: reviews, error } = await supabaseAdmin
            .from('reviews')
            .select(`
        id,
        company_id,
        user_id,
        rating,
        comment,
        owner_response,
        created_at,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar avaliações:', error);
            return NextResponse.json({ error: 'Erro ao buscar avaliações' }, { status: 500 });
        }

        const formattedReviews = reviews?.map((r: any) => {
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            return {
                id: r.id,
                company_id: r.company_id,
                user_id: r.user_id,
                rating: r.rating,
                comment: r.comment,
                owner_response: r.owner_response,
                created_at: r.created_at,
                customer_name: profile?.full_name || 'Usuário Anônimo',
                customer_avatar_url: profile?.avatar_url || null,
            };
        }) || [];

        return NextResponse.json({
            data: formattedReviews
        });
    } catch (error) {
        console.error('Erro interno ao buscar avaliações:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
