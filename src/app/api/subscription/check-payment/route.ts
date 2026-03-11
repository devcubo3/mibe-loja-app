import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { checkPixStatus } from '@/lib/abacatepay';

/**
 * GET /api/subscription/check-payment?payment_id=pix_char_xxx
 *
 * Verifica o status de um pagamento PIX no AbacatePay.
 * Se pago, atualiza payment_history diretamente (fallback ao webhook).
 * O trigger fn_check_company_reactivation cuida do restante.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();

    const { companyId } = auth;
    const paymentId = request.nextUrl.searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json({ error: 'payment_id é obrigatório' }, { status: 400 });
    }

    // Verificar que esta fatura pertence à empresa autenticada
    const supabaseAdmin = getSupabaseAdmin();
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('payment_history')
      .select('id, status, subscription_id, subscriptions!inner(company_id)')
      .eq('gateway_reference', paymentId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 });
    }

    const sub = invoice.subscriptions as { company_id: string } | null;
    if (!sub || sub.company_id !== companyId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    // Já paga — retornar sem chamar AbacatePay
    if (invoice.status === 'paid') {
      return NextResponse.json({ status: 'PAID', is_paid: true });
    }

    // Checar status no AbacatePay
    const pixStatus = await checkPixStatus(paymentId);

    if (!pixStatus) {
      return NextResponse.json({ status: 'UNKNOWN', is_paid: false });
    }

    if (pixStatus.status === 'PAID') {
      // Atualizar diretamente (fallback ao webhook)
      await supabaseAdmin
        .from('payment_history')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString(),
        })
        .eq('gateway_reference', paymentId);

      return NextResponse.json({ status: 'PAID', is_paid: true });
    }

    return NextResponse.json({ status: pixStatus.status, is_paid: false });
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
