'use client';

import { Users, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { SubscriptionWithPlan } from '@/types/plan';

interface UsageProgressBarProps {
  subscription: SubscriptionWithPlan;
}

export function UsageProgressBar({ subscription }: UsageProgressBarProps) {
  const { current_profile_count, excess_profiles, excess_amount, plan } = subscription;
  const percent = Math.min((current_profile_count / plan.user_limit) * 100, 100);
  const isOverLimit = current_profile_count > plan.user_limit;

  const getBarColor = () => {
    if (isOverLimit || percent > 90) return 'bg-error';
    if (percent > 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-xs">
        <div className="flex items-center gap-xs">
          <Users className="w-4 h-4 text-secondary" />
          <span className="text-body text-secondary">Uso de clientes</span>
        </div>
        <span className={cn(
          'text-body font-semibold',
          isOverLimit ? 'text-error' : 'text-primary'
        )}>
          {current_profile_count} / {plan.user_limit}
        </span>
      </div>

      <div className="w-full h-2.5 bg-input-bg rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getBarColor())}
          style={{ width: `${percent}%` }}
        />
      </div>

      {isOverLimit && (
        <div className="flex items-center gap-sm mt-sm p-sm bg-error-light rounded-lg">
          <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-caption text-error">
            <span className="font-semibold">{excess_profiles} clientes excedentes</span>
            {' '}&mdash; custo adicional de {formatCurrency(excess_amount)}/mês
          </p>
        </div>
      )}
    </div>
  );
}
