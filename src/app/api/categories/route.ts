import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        const { data, error } = await supabaseAdmin
            .from('categories')
            .select('id, name')
            .order('name');

        if (error) {
            console.error('Erro ao buscar categorias:', error);
            return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Erro interno:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
