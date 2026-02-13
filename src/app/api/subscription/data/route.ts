import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
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

    // Buscar tudo em paralelo
    const [plansResult, subscriptionResult] = await Promise.all([
      // Todos os planos ativos
      supabaseAdmin
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true }),

      // Assinatura da empresa com dados do plano
      supabaseAdmin
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('company_id', companyId)
        .single(),
    ]);

    if (plansResult.error) {
      console.error('Erro ao buscar planos:', plansResult.error);
      return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 });
    }

    // Subscription pode não existir (PGRST116)
    const subscription = subscriptionResult.error?.code === 'PGRST116'
      ? null
      : subscriptionResult.error
        ? null
        : subscriptionResult.data;

    // Buscar histórico de pagamentos se houver assinatura
    let payments: any[] = [];
    if (subscription) {
      const { data: paymentsData, error: paymentsError } = await supabaseAdmin
        .from('payment_history')
        .select('*')
        .eq('subscription_id', subscription.id)
        .order('due_date', { ascending: false });

      if (!paymentsError && paymentsData) {
        payments = paymentsData;
      }
    }

    return NextResponse.json({
      plans: plansResult.data || [],
      subscription,
      payments,
    });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
