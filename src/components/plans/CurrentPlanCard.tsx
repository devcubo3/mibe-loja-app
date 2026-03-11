'use client';

import { Crown, AlertOctagon } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { SubscriptionWithPlan, PaymentRecord } from '@/types/plan';
import { SUBSCRIPTION_STATUS_CONFIG } from '@/types/plan';

interface CurrentPlanCardProps {
  subscription: SubscriptionWithPlan;
  companyIsActive: boolean;
  pendingInvoices: PaymentRecord[];
}

export function CurrentPlanCard({ subscription, companyIsActive, pendingInvoices }: CurrentPlanCardProps) {
  const { plan, status } = subscription;
  const statusConfig = SUBSCRIPTION_STATUS_CONFIG[status];

  const nextMensalidade = pendingInvoices.find(inv => inv.type === 'MENSALIDADE');

  return (
    <Card variant="filled">
      <CardContent className="p-lg">
        {!companyIsActive && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-md mb-md flex items-start gap-sm">
            <AlertOctagon className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-body text-error font-medium">
              Conta bloqueada por faturas em atraso. Pague as faturas pendentes para reativar sua conta.
            </p>
          </div>
        )}

        {status === 'pending_payment' && (
          <div className="bg-warning-light border border-warning/20 rounded-xl p-md mb-md flex items-start gap-sm">
            <AlertOctagon className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-body text-warning font-medium">
              Assinatura aguardando confirmação de pagamento. Realize o pagamento da fatura pendente para ativar sua conta.
            </p>
          </div>
        )}

        {status === 'overdue' && companyIsActive && (
          <div className="bg-warning-light border border-warning/20 rounded-xl p-md mb-md">
            <p className="text-body text-warning font-medium">
              Sua assinatura está inadimplente. Regularize para continuar utilizando todos os recursos.
            </p>
          </div>
        )}

        <div className="flex items-start justify-between mb-md">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-body-lg font-semibold text-primary">{plan.name}</h3>
              <p className="text-caption text-secondary">Plano atual</p>
            </div>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div>
            <p className="text-caption text-secondary">Mensalidade</p>
            <p className="text-body-lg font-semibold text-primary">{formatCurrency(plan.monthly_price)}/mês</p>
          </div>
          <div>
            <p className="text-caption text-secondary">Comissão diária</p>
            <p className="text-body-lg font-semibold text-primary">{plan.commission_percent}% sobre vendas</p>
          </div>
          {nextMensalidade && (
            <div className="col-span-2">
              <p className="text-caption text-secondary">Próximo vencimento</p>
              <p className="text-body font-medium text-primary">{formatDate(nextMensalidade.due_date)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
