import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Em produção, usar SERVICE_ROLE para bypass RLS se necessário
);

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let companyId: string;

        try {
            const tokenData = JSON.parse(atob(token));
            if (tokenData.exp < Date.now()) {
                return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
            }
            companyId = tokenData.companyId;
        } catch {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        const data = await request.json();

        // Mapeamento de campos do frontend para o banco de dados
        const updatePayload: any = {
            updated_at: new Date().toISOString(),
        };

        if (data.name) updatePayload.business_name = data.name;
        if (data.email) updatePayload.email = data.email;
        if (data.description !== undefined) updatePayload.description = data.description;
        if (data.cashback_percentage !== undefined) updatePayload.cashback_percent = data.cashback_percentage;
        if (data.has_expiration !== undefined) updatePayload.has_expiration = data.has_expiration;
        if (data.expiration_days !== undefined) updatePayload.expiration_days = data.expiration_days;
        if (data.min_purchase !== undefined) updatePayload.min_purchase_value = data.min_purchase;
        if (data.category_id) updatePayload.category_id = data.category_id;
        if (data.logo_url) updatePayload.logo_url = data.logo_url;
        if (data.cover_image) updatePayload.cover_url = data.cover_image;

        const { error } = await supabase
            .from('companies')
            .update(updatePayload)
            .eq('id', companyId);

        if (error) {
            console.error('Erro no update:', error);
            return NextResponse.json({ error: 'Erro ao atualizar banco de dados' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
