import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, requireOwner, AuthError } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getDatePlusDays } from '@/lib/utils';

/**
 * POST /api/subscription/subscribe
 *
 * Auto-assinatura: empresa sem assinatura assina o plano diretamente.
 * Cria o registro de assinatura e a primeira fatura de mensalidade.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (auth instanceof AuthError) return auth.toResponse();
    const ownerCheck = requireOwner(auth);
    if (ownerCheck) return ownerCheck.toResponse();

    const { companyId } = auth;
    const supabaseAdmin = getSupabaseAdmin();

    const { plan_id } = await request.json();

    if (!plan_id) {
      return NextResponse.json({ error: 'ID do plano é obrigatório' }, { status: 400 });
    }

    // Verificar plano ativo
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plano não encontrado ou inativo' }, { status: 404 });
    }

    // Verificar se já existe assinatura ativa (ignora cancelled e overdue se trial)
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status')
      .eq('company_id', companyId)
      .neq('status', 'cancelled')
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Empresa já possui uma assinatura ativa' }, { status: 409 });
    }

    // Verificar se a empresa já usou o trial e o plano é trial
    const { data: companyRecord } = await supabaseAdmin
      .from('companies')
      .select('trial_used_at')
      .eq('id', companyId)
      .single();

    if (plan.is_trial && companyRecord?.trial_used_at) {
      return NextResponse.json({ error: 'A empresa já utilizou o período de teste grátis' }, { status: 409 });
    }

    // Criar assinatura (pending_payment até webhook confirmar pagamento SE PAGO, ou active direto SE TRIAL)
    const isTrial = plan.is_trial;
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        company_id: companyId,
        plan_id,
        status: isTrial ? 'active' : 'pending_payment',
        started_at: new Date().toISOString(),
        expires_at: isTrial ? getDatePlusDays(plan.trial_duration_days || 60) : null,
      })
      .select('*, plans(*)')
      .single();


    if (subError || !subscription) {
      console.error('Erro ao criar assinatura:', subError);
      return NextResponse.json({ error: 'Erro ao criar assinatura' }, { status: 500 });
    }

    let invoice = null;

    if (!isTrial) {
      // Gerar primeira fatura de mensalidade (vencimento em 7 dias)
      const { data: newInvoice, error: invoiceError } = await supabaseAdmin
        .from('payment_history')
        .insert({
          subscription_id: subscription.id,
          type: 'MENSALIDADE',
          amount: Number(plan.monthly_price),
          status: 'pending',
          due_date: getDatePlusDays(7),
        })
        .select('*')
        .single();

      if (invoiceError) {
        console.error('Erro ao gerar fatura:', invoiceError);
        // Não falhar a assinatura por isso — retorna sem invoice
      } else {
        invoice = newInvoice;
      }
    } else {
      // Marcar na empresa que ela usou o trial
      await supabaseAdmin
        .from('companies')
        .update({ trial_used_at: new Date().toISOString() })
        .eq('id', companyId);
    }

    return NextResponse.json({ success: true, subscription, invoice });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
