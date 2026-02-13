import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let companyId: string;

        try {
            const tokenData = JSON.parse(atob(token));
            companyId = tokenData.companyId;
        } catch {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select(`
        id,
        business_name,
        cnpj,
        email,
        description,
        logo_url,
        cover_url,
        status,
        cashback_percent,
        min_purchase_value,
        has_expiration,
        expiration_days,
        category_id,
        created_at
      `)
            .eq('id', companyId)
            .single();

        if (companyError || !company) {
            return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
        }

        // Buscar categoria
        let categoryName = 'Outros';
        if (company.category_id) {
            const { data: category } = await supabase
                .from('categories')
                .select('name')
                .eq('id', company.category_id)
                .single();
            if (category) categoryName = category.name;
        }

        // Buscar fotos
        const { data: gallery } = await supabase
            .from('company_gallery')
            .select('photo_url')
            .eq('company_id', company.id);

        // Buscar avaliações
        const { data: reviewsData } = await supabase
            .from('reviews')
            .select('rating')
            .eq('company_id', company.id);

        const totalReviews = reviewsData?.length || 0;
        const avgRating = totalReviews > 0
            ? reviewsData!.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
            : 0;

        return NextResponse.json({
            company: {
                id: company.id,
                business_name: company.business_name,
                cnpj: company.cnpj,
                email: company.email,
                description: company.description,
                logo_url: company.logo_url,
                cover_url: company.cover_url,
                status: company.status,
                cashback_percent: company.cashback_percent || 0,
                min_purchase_value: company.min_purchase_value || 0,
                has_expiration: company.has_expiration || false,
                expiration_days: company.expiration_days || 30,
                category: categoryName,
                photos: gallery?.map(g => g.photo_url) || [],
                rating: Math.round(avgRating * 10) / 10,
                total_reviews: totalReviews,
                created_at: company.created_at,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
