'use client';

import { Modal, Button, Badge } from '@/components/ui';
import { Crown } from 'lucide-react';
import type { Plan } from '@/types/plan';

interface TrialConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  isLoading: boolean;
  onConfirm: () => void;
}

export function TrialConfirmationModal({
  isOpen,
  onClose,
  plan,
  isLoading,
  onConfirm,
}: TrialConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Começar Teste Grátis">
      <div className="space-y-lg">
        {/* Card visual */}
        <div className="p-lg bg-green-50 rounded-xl border border-green-200 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-bl-full -z-10" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-green-400/10 rounded-tr-full -z-10" />
          
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-md">
            <Crown className="w-8 h-8 text-green-600" />
          </div>

          <h3 className="text-header font-bold text-green-800 mb-xs">
            {plan.trial_duration_days || 60} Dias de Teste Grátis
          </h3>
          <p className="text-body text-green-700">
            Experimente o plano <span className="font-semibold">{plan.name}</span> gratuitamente. Você terá todos os recursos liberados para impulsionar suas vendas!
          </p>

          <div className="mt-md pt-md border-t border-green-200/60 grid grid-cols-2 gap-md text-left">
            <div>
              <p className="text-caption text-green-600">Mensalidade</p>
              <p className="text-body font-semibold text-green-800">Grátis</p>
            </div>
            <div>
              <p className="text-caption text-green-600">Comissão diária</p>
              <p className="text-body font-semibold text-green-800">{plan.commission_percent}% sobre vendas</p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-md">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button fullWidth onClick={onConfirm} loading={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
            Ativar teste agora
          </Button>
        </div>
      </div>
    </Modal>
  );
}
