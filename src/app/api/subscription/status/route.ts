import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/subscription/status
 *
 * Verificação leve do status de assinatura e conta.
 * Usada pela página registrar-venda como gate check.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();

    const { companyId } = auth;
    const supabaseAdmin = getSupabaseAdmin();

    const [subscriptionResult, companyResult] = await Promise.all([
      supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('company_id', companyId)
        .neq('status', 'cancelled')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabaseAdmin
        .from('companies')
        .select('is_active')
        .eq('id', companyId)
        .single(),
    ]);

    const hasActiveSubscription =
      !subscriptionResult.error &&
      !!subscriptionResult.data &&
      (subscriptionResult.data.status === 'active' || subscriptionResult.data.status === 'pending_payment');

    const companyIsActive = companyResult.data?.is_active ?? true;

    return NextResponse.json({ has_active_subscription: hasActiveSubscription, company_is_active: companyIsActive });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
