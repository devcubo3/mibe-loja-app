'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { SkeletonCard, SkeletonText, EmptyState } from '@/components/ui';
import { usePlans } from '@/hooks/usePlans';
import {
  CurrentPlanCard,
  PlanCard,
  PaymentModal,
  PaymentHistoryTable,
} from '@/components/plans';
import type { Plan } from '@/types/plan';

export default function PlanosPage() {
  const {
    plans,
    subscription,
    payments,
    isLoading,
    error,
  } = usePlans();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  if (isLoading) {
    return (
      <div className="page-container max-w-5xl mx-auto">
        <div className="mb-xl">
          <SkeletonText className="h-8 w-64 mb-sm" />
          <SkeletonText className="h-5 w-96" />
        </div>
        <SkeletonCard className="h-48 mb-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-xl">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
        <SkeletonCard className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container max-w-5xl mx-auto">
        <EmptyState
          icon={<CreditCard className="w-12 h-12" />}
          title="Erro ao carregar"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="page-container max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-xl">
        <h1 className="heading-primary">Planos & Assinatura</h1>
        <p className="text-body text-secondary mt-xs">
          Gerencie seu plano e acompanhe o uso do sistema
        </p>
      </div>

      {/* Plano atual + uso */}
      {subscription ? (
        <div className="mb-xl">
          <CurrentPlanCard subscription={subscription} />
        </div>
      ) : (
        <div className="mb-xl">
          <EmptyState
            icon={<CreditCard className="w-12 h-12" />}
            title="Sem assinatura"
            description="Nenhuma assinatura ativa encontrada. Selecione um plano abaixo."
          />
        </div>
      )}

      {/* Planos disponíveis */}
      <div className="mb-xl">
        <h2 className="section-title mb-md">Planos disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={subscription?.plan_id === plan.id}
              isCancelled={subscription?.status === 'cancelled'}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>

      {/* Histórico de pagamentos */}
      <div>
        <h2 className="section-title mb-md">Histórico de pagamentos</h2>
        <PaymentHistoryTable payments={payments} />
      </div>

      {/* Modal de pagamento */}
      {selectedPlan && (
        <PaymentModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          plan={selectedPlan}
          currentSubscription={subscription}
        />
      )}
    </div>
  );
}
