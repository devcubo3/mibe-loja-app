import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, AuthError } from '@/lib/auth-helpers';
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

    // Verificar se já existe assinatura ativa (ignora cancelled)
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

    // Criar assinatura (pending_payment até webhook confirmar pagamento)
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        company_id: companyId,
        plan_id,
        status: 'pending_payment',
        started_at: new Date().toISOString(),
      })
      .select('*, plans(*)')
      .single();

    if (subError || !subscription) {
      console.error('Erro ao criar assinatura:', subError);
      return NextResponse.json({ error: 'Erro ao criar assinatura' }, { status: 500 });
    }

    // Gerar primeira fatura de mensalidade (vencimento em 7 dias)
    const { data: invoice, error: invoiceError } = await supabaseAdmin
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
    }

    return NextResponse.json({ success: true, subscription, invoice: invoice || null });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
