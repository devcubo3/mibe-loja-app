import type { Plan as PlanRow, Subscription as SubscriptionRow, PaymentHistory as PaymentHistoryRow } from './database';

// Re-exportar tipos base do banco
export type Plan = PlanRow;
export type PaymentRecord = PaymentHistoryRow;

// Status tipados (o banco usa string genérica)
export type SubscriptionStatus = 'active' | 'overdue' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Subscription com plan joinado
export interface SubscriptionWithPlan extends Omit<SubscriptionRow, 'status'> {
  status: SubscriptionStatus;
  plan: Plan;
}

// Labels e cores para status de assinatura
export const SUBSCRIPTION_STATUS_CONFIG: Record<SubscriptionStatus, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  active: { label: 'Ativa', variant: 'success' },
  overdue: { label: 'Inadimplente', variant: 'warning' },
  cancelled: { label: 'Cancelada', variant: 'error' },
};

// Labels e cores para status de pagamento
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'dark' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  paid: { label: 'Pago', variant: 'success' },
  failed: { label: 'Falhou', variant: 'error' },
  refunded: { label: 'Reembolsado', variant: 'dark' },
};
