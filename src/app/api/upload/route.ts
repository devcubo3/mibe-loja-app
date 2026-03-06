import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const auth = await validateAuth(request);
        if (auth instanceof AuthError) return auth.toResponse();

        const { companyId } = auth;
        const supabaseAdmin = getSupabaseAdmin();

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const type = formData.get('type') as string | null;

        if (!file || !type) {
            return NextResponse.json({ error: 'Arquivo e tipo são obrigatórios' }, { status: 400 });
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${companyId}/${type}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('store-assets')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Erro no upload:', uploadError);
            return NextResponse.json({ error: 'Erro no upload do arquivo' }, { status: 500 });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('store-assets')
            .getPublicUrl(fileName);

        return NextResponse.json({ publicUrl });
    } catch (error) {
        console.error('Erro interno no upload:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
