import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId } = auth;
        const supabase = getSupabaseAdmin();
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
        if (data.address !== undefined) updatePayload.address = data.address;
        if (data.latitude !== undefined) updatePayload.latitude = data.latitude;
        if (data.longitude !== undefined) updatePayload.longitude = data.longitude;

        const { data: updated, error } = await supabase
            .from('companies')
            .update(updatePayload)
            .eq('id', companyId)
            .select()
            .single();

        if (error || !updated) {
            console.error('Erro no update:', JSON.stringify({
                code: error?.code,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                companyId,
                payload: updatePayload,
            }, null, 2));
            return NextResponse.json({ 
                error: 'Erro ao atualizar banco de dados',
                details: error?.message || 'Registro não encontrado',
                code: error?.code,
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, company: updated });
    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
