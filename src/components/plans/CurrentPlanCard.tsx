'use client';

import { Crown } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { UsageProgressBar } from './UsageProgressBar';
import type { SubscriptionWithPlan } from '@/types/plan';
import { SUBSCRIPTION_STATUS_CONFIG } from '@/types/plan';

interface CurrentPlanCardProps {
  subscription: SubscriptionWithPlan;
}

export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const { plan, status } = subscription;
  const statusConfig = SUBSCRIPTION_STATUS_CONFIG[status];

  return (
    <Card variant="filled">
      <CardContent className="p-lg">
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

        {status === 'overdue' && (
          <div className="bg-warning-light border border-warning/20 rounded-xl p-md mb-md">
            <p className="text-body text-warning font-medium">
              Sua assinatura está inadimplente. Regularize para continuar utilizando todos os recursos.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-md mb-lg">
          <div>
            <p className="text-caption text-secondary">Mensalidade</p>
            <p className="text-body-lg font-semibold text-primary">{formatCurrency(plan.monthly_price)}</p>
          </div>
          <div>
            <p className="text-caption text-secondary">Limite de clientes</p>
            <p className="text-body-lg font-semibold text-primary">{plan.user_limit}</p>
          </div>
          <div>
            <p className="text-caption text-secondary">Taxa excedente</p>
            <p className="text-body-lg font-semibold text-primary">{formatCurrency(plan.excess_user_fee)}/cliente</p>
          </div>
        </div>

        <UsageProgressBar subscription={subscription} />
      </CardContent>
    </Card>
  );
}
