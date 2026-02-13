'use client';

import { Lock, AlertCircle } from 'lucide-react';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import { formatCPF, formatCurrency, formatDate } from '@/lib/formatters';
import type { CustomerWithBalance } from '@/types/customer';

interface CustomerPreviewProps {
  customer: CustomerWithBalance;
  onContinue: () => void;
  onCancel: () => void;
}

export function CustomerPreview({
  customer,
  onContinue,
  onCancel,
}: CustomerPreviewProps) {
  return (
    <div className="space-y-lg">
      {/* Success Badge */}
      <div className="flex items-center gap-sm text-success">
        <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <span className="font-semibold">Cliente encontrado</span>
      </div>

      {/* Customer Card */}
      <Card variant="default" padding="lg">
        {/* Header with Avatar */}
        <div className="bg-primary -mx-lg -mt-lg px-lg py-lg mb-lg rounded-t-md flex items-center gap-md">
          <Avatar name={customer.full_name} size="lg" />
          <div>
            <p className="text-body-lg font-semibold text-white">
              {customer.full_name}
            </p>
            <Badge variant="light">{formatCPF(customer.cpf)}</Badge>
          </div>
        </div>

        {/* Info Fields */}
        <div className="space-y-md">
          <InfoField label="Nome completo" value={customer.full_name} />
          <InfoField label="CPF" value={formatCPF(customer.cpf)} />
          {customer.birth_date && (
            <InfoField
              label="Data de Nascimento"
              value={formatDate(customer.birth_date)}
            />
          )}

          {/* Balance */}
          <div className="bg-success-light rounded-md p-md flex items-center justify-between">
            <div>
              <p className="text-caption text-text-secondary">
                Saldo disponível na sua loja
              </p>
              <p className="text-subtitle font-bold text-success">
                {formatCurrency(customer.storeBalance?.balance || 0)}
              </p>
            </div>
            {customer.storeBalance?.balance > 0 && (
              <Badge variant="success">Disponível</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-sm text-text-secondary bg-warning-light rounded-md p-md">
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-body">
          Você pode apenas visualizar os dados do cliente. Nenhuma alteração é
          permitida.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-md">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
        <Button onClick={onContinue} fullWidth>
          Continuar
        </Button>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  locked = true,
}: {
  label: string;
  value: string;
  locked?: boolean;
}) {
  return (
    <div className="border-b border-input-border pb-sm last:border-0 last:pb-0">
      <p className="text-caption text-text-muted mb-xs">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-body-lg text-text-primary">{value}</p>
        {locked && <Lock className="w-4 h-4 text-text-muted" />}
      </div>
    </div>
  );
}
