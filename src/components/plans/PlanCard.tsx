'use client';

import { Check } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/plan';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isCancelled: boolean;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, isCurrentPlan, isCancelled, onSelect }: PlanCardProps) {
  return (
    <Card
      variant={isCurrentPlan ? 'highlight' : 'default'}
      className={cn(
        'relative',
        isCurrentPlan && 'ring-2 ring-primary'
      )}
    >
      <CardContent className="p-lg">
        {plan.is_trial && !isCurrentPlan && (
          <Badge variant="success" className="absolute top-md right-md">
            {plan.trial_duration_days || 60} DIAS GRÁTIS
          </Badge>
        )}
        {isCurrentPlan && (
          <Badge variant="dark" className="absolute top-md right-md">
            Plano atual
          </Badge>
        )}

        <h3 className={cn(
          'text-title font-bold mb-xs',
          isCurrentPlan ? 'text-white' : 'text-primary'
        )}>
          {plan.name}
        </h3>

        {plan.description && (
          <p className={cn(
            'text-body mb-lg',
            isCurrentPlan ? 'text-white/70' : 'text-secondary'
          )}>
            {plan.description}
          </p>
        )}

        <div className="mb-lg">
          <span className={cn(
            'text-header font-bold',
            isCurrentPlan ? 'text-white' : 'text-primary'
          )}>
            {plan.is_trial ? 'Grátis' : formatCurrency(plan.monthly_price)}
          </span>
          <span className={cn(
            'text-body',
            isCurrentPlan ? 'text-white/70' : 'text-secondary'
          )}>
            {plan.is_trial ? ` por ${plan.trial_duration_days || 60} dias` : '/mês'}
          </span>
        </div>

        <div className="space-y-sm mb-lg">
          <Feature
            text={`${plan.commission_percent}% de comissão sobre vendas diárias`}
            isCurrentPlan={isCurrentPlan}
          />
        </div>

        <Button
          variant={isCurrentPlan ? 'secondary' : 'primary'}
          fullWidth
          disabled={isCurrentPlan || isCancelled}
          onClick={() => onSelect(plan)}
        >
          {isCurrentPlan ? 'Plano ativo' : (plan.is_trial ? 'Começar teste grátis' : 'Assinar plano')}
        </Button>
      </CardContent>
    </Card>
  );
}

function Feature({ text, isCurrentPlan }: { text: string; isCurrentPlan: boolean }) {
  return (
    <div className="flex items-center gap-sm">
      <Check className={cn(
        'w-4 h-4 flex-shrink-0',
        isCurrentPlan ? 'text-white' : 'text-success'
      )} />
      <span className={cn(
        'text-body',
        isCurrentPlan ? 'text-white/90' : 'text-primary'
      )}>
        {text}
      </span>
    </div>
  );
}
