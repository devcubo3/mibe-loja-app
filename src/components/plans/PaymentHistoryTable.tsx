'use client';

import { Receipt, FileText } from 'lucide-react';
import { Badge, EmptyState } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { PaymentRecord, PaymentStatus, InvoiceType } from '@/types/plan';
import { PAYMENT_STATUS_CONFIG, INVOICE_TYPE_CONFIG } from '@/types/plan';

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="w-12 h-12" />}
        title="Nenhum pagamento"
        description="O histórico de pagamentos aparecerá aqui."
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-sm">
      {payments.map((payment) => {
        const statusConfig = PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus] || PAYMENT_STATUS_CONFIG.pending;
        const typeLabel = INVOICE_TYPE_CONFIG[payment.type as InvoiceType]?.label || payment.type;

        return (
          <div
            key={payment.id}
            className="w-44 flex flex-col items-start gap-xs p-md rounded-3xl border border-input-border bg-card-bg"
          >
            {/* Ícone */}
            <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center mb-xs">
              <FileText className="w-5 h-5 text-primary" />
            </div>

            {/* Tipo */}
            <p className="text-body font-bold text-primary leading-snug">{typeLabel}</p>

            {/* Referência */}
            {payment.commission_date && (
              <p className="text-body text-secondary">{formatDate(payment.commission_date)}</p>
            )}

            {/* Valor */}
            <p className="text-title font-bold text-primary">{formatCurrency(payment.amount)}</p>

            {/* Vencimento */}
            <p className="text-body text-secondary">Venc. {formatDate(payment.due_date)}</p>

            {/* Status */}
            <Badge variant={statusConfig.variant}>
              {statusConfig.label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
