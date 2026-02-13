import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Validar token
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

    const { plan_id } = await request.json();

    if (!plan_id) {
      return NextResponse.json({ error: 'ID do plano é obrigatório' }, { status: 400 });
    }

    // Verificar se o plano existe e está ativo
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plano não encontrado ou inativo' }, { status: 404 });
    }

    // Buscar assinatura ativa da empresa
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
    }

    if (subscription.status === 'cancelled') {
      return NextResponse.json({ error: 'Não é possível trocar de plano com assinatura cancelada' }, { status: 400 });
    }

    if (subscription.plan_id === plan_id) {
      return NextResponse.json({ error: 'Este já é o seu plano atual' }, { status: 400 });
    }

    // Atualizar plano da assinatura
    // O trigger recalculate_on_plan_change cuida do recálculo de excedentes
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        plan_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)
      .select('*, plans(*)')
      .single();

    if (updateError) {
      console.error('Erro ao atualizar assinatura:', updateError);
      return NextResponse.json({ error: 'Erro ao trocar de plano' }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
