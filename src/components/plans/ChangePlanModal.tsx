'use client';

import { ArrowRight } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import type { Plan, SubscriptionWithPlan } from '@/types/plan';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: SubscriptionWithPlan;
  newPlan: Plan;
  isLoading: boolean;
  onConfirm: () => void;
}

export function ChangePlanModal({
  isOpen,
  onClose,
  currentSubscription,
  newPlan,
  isLoading,
  onConfirm,
}: ChangePlanModalProps) {
  const currentPlan = currentSubscription.plan;
  const isUpgrade = newPlan.monthly_price > currentPlan.monthly_price;

  // Estimar novo excedente com o novo plano
  const newExcessProfiles = Math.max(0, currentSubscription.current_profile_count - newPlan.user_limit);
  const newExcessAmount = newExcessProfiles * newPlan.excess_user_fee;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar troca de plano">
      <div className="space-y-lg">
        {/* Comparação visual */}
        <div className="flex items-center gap-md">
          <div className="flex-1 p-md bg-input-bg rounded-xl text-center">
            <p className="text-caption text-secondary mb-xs">Plano atual</p>
            <p className="text-body-lg font-semibold text-primary">{currentPlan.name}</p>
            <p className="text-body text-secondary">{formatCurrency(currentPlan.monthly_price)}/mês</p>
          </div>

          <ArrowRight className="w-5 h-5 text-secondary flex-shrink-0" />

          <div className="flex-1 p-md bg-primary/5 border border-primary/20 rounded-xl text-center">
            <p className="text-caption text-secondary mb-xs">Novo plano</p>
            <p className="text-body-lg font-semibold text-primary">{newPlan.name}</p>
            <p className="text-body text-secondary">{formatCurrency(newPlan.monthly_price)}/mês</p>
          </div>
        </div>

        {/* Detalhes do impacto */}
        <div className="space-y-sm">
          <div className="flex justify-between py-sm border-b border-input-border">
            <span className="text-body text-secondary">Novo limite de clientes</span>
            <span className="text-body font-semibold text-primary">{newPlan.user_limit}</span>
          </div>
          <div className="flex justify-between py-sm border-b border-input-border">
            <span className="text-body text-secondary">Clientes atuais</span>
            <span className="text-body font-semibold text-primary">{currentSubscription.current_profile_count}</span>
          </div>
          {newExcessProfiles > 0 && (
            <div className="flex justify-between py-sm border-b border-input-border">
              <span className="text-body text-error">Excedentes estimados</span>
              <span className="text-body font-semibold text-error">
                {newExcessProfiles} clientes (+{formatCurrency(newExcessAmount)})
              </span>
            </div>
          )}
          <div className="flex justify-between py-sm">
            <span className="text-body text-secondary">Tipo de alteração</span>
            <span className={`text-body font-semibold ${isUpgrade ? 'text-success' : 'text-warning'}`}>
              {isUpgrade ? 'Upgrade' : 'Downgrade'}
            </span>
          </div>
        </div>

        {/* Aviso de downgrade com excedentes */}
        {!isUpgrade && newExcessProfiles > 0 && (
          <div className="bg-warning-light border border-warning/20 rounded-xl p-md">
            <p className="text-body text-warning">
              Com este plano, você terá {newExcessProfiles} clientes acima do limite,
              gerando um custo adicional de {formatCurrency(newExcessAmount)}/mês.
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-md">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onConfirm} loading={isLoading}>
            Confirmar troca
          </Button>
        </div>
      </div>
    </Modal>
  );
}
