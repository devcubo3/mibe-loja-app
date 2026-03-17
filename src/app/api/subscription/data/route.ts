import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();

    const { companyId } = auth;
    const supabaseAdmin = getSupabaseAdmin();

    // Buscar tudo em paralelo
    const [plansResult, subscriptionResult, companyResult] = await Promise.all([
      supabaseAdmin
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true }),

      supabaseAdmin
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('company_id', companyId)
        .neq('status', 'cancelled')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabaseAdmin
        .from('companies')
        .select('is_active, trial_used_at')
        .eq('id', companyId)
        .single(),
    ]);

    if (plansResult.error) {
      console.error('Erro ao buscar planos:', plansResult.error);
      return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 });
    }

    const companyData = companyResult.data;
    const hasUsedTrial = !!companyData?.trial_used_at;

    // Filtrar planos:
    // Se nunca usou trial, mostrar apenas trial
    // Se já usou trial, mostrar apenas planos pagos
    let filteredPlans = plansResult.data || [];
    if (hasUsedTrial) {
      filteredPlans = filteredPlans.filter(p => !p.is_trial);
    } else {
      filteredPlans = filteredPlans.filter(p => p.is_trial);
    }

    const subscription = subscriptionResult.error ? null : subscriptionResult.data;

    let pendingInvoices: any[] = [];
    let paidInvoices: any[] = [];

    // Faturas da assinatura ativa (mensalidades + histórico pago)
    if (subscription) {
      const { data: paymentsData, error: paymentsError } = await supabaseAdmin
        .from('payment_history')
        .select('*')
        .eq('subscription_id', subscription.id)
        .order('due_date', { ascending: false });

      if (!paymentsError && paymentsData) {
        pendingInvoices = paymentsData.filter(p => p.status === 'pending' || p.status === 'overdue');
        paidInvoices = paymentsData.filter(p => p.status === 'paid');
      }
    }

    // Comissões diárias pendentes de assinaturas anteriores (dívidas reais de vendas)
    const activeSubId = subscription?.id;
    const { data: oldCommissions } = await supabaseAdmin
      .from('payment_history')
      .select('id, subscription_id, amount, status, due_date, type, commission_date, gateway_reference, payment_date, created_at, subscriptions!inner(company_id)')
      .eq('subscriptions.company_id', companyId)
      .eq('type', 'COMISSAO_DIARIA')
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: false });

    if (oldCommissions) {
      const currentSubCommissionIds = new Set(pendingInvoices.map((p: any) => p.id));
      const extraCommissions = oldCommissions
        .filter((c: any) => !currentSubCommissionIds.has(c.id))
        .map(({ subscriptions: _sub, ...rest }: any) => rest);
      pendingInvoices = [...pendingInvoices, ...extraCommissions];
    }

    // COMISSAO_DIARIA pagas de TODAS as assinaturas da empresa
    const { data: paidCommissions } = await supabaseAdmin
      .from('payment_history')
      .select('id, subscription_id, amount, status, due_date, type, commission_date, gateway_reference, payment_date, created_at, subscriptions!inner(company_id)')
      .eq('subscriptions.company_id', companyId)
      .eq('type', 'COMISSAO_DIARIA')
      .eq('status', 'paid')
      .order('due_date', { ascending: false });

    if (paidCommissions) {
      const currentSubPaidIds = new Set(paidInvoices.map((p: any) => p.id));
      const extraPaid = paidCommissions
        .filter((c: any) => !currentSubPaidIds.has(c.id))
        .map(({ subscriptions: _sub, ...rest }: any) => rest);
      paidInvoices = [...paidInvoices, ...extraPaid];
    }

    return NextResponse.json({
      plans: plansResult.data || [],
      subscription,
      pending_invoices: pendingInvoices,
      paid_invoices: paidInvoices,
      company_is_active: companyResult.data?.is_active ?? true,
    });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
