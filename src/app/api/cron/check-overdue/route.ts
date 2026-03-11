import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/cron/check-overdue
 *
 * Fallback manual para o job de inadimplência.
 * A execução automática é feita pelo pg_cron no Supabase (fn_check_overdue_invoices)
 * todo dia às 05:00 UTC — este endpoint serve apenas para acionamento manual
 * ou emergências.
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin.rpc('fn_check_overdue_invoices');

        if (error) {
            console.error('Erro ao executar fn_check_overdue_invoices:', error);
            return NextResponse.json({ error: 'Erro ao executar job de inadimplência' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Ok' });
    } catch (err) {
        console.error('Erro no cron check-overdue:', err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
