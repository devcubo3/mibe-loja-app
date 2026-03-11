'use client';

import { AlertCircle, FileText } from 'lucide-react';
import { Badge, Button, EmptyState } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { PaymentRecord, PaymentStatus, InvoiceType } from '@/types/plan';
import { PAYMENT_STATUS_CONFIG, INVOICE_TYPE_CONFIG } from '@/types/plan';

interface PendingInvoicesTableProps {
  invoices: PaymentRecord[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onPayClick: () => void;
  totalSelectedAmount: number;
}

export function PendingInvoicesTable({
  invoices,
  selectedIds,
  onSelectionChange,
  onPayClick,
  totalSelectedAmount,
}: PendingInvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-12 h-12" />}
        title="Nenhuma fatura pendente"
        description="Todas as suas faturas estão em dia."
      />
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const allSelected = invoices.every(inv => selectedIds.includes(inv.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(invoices.map(inv => inv.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-md">
      {/* Selecionar tudo */}
      <div className="flex items-center justify-between">
        <p className="text-caption text-secondary">{invoices.length} fatura{invoices.length !== 1 ? 's' : ''}</p>
        <button onClick={toggleAll} className="text-caption text-primary underline">
          {allSelected ? 'Desmarcar tudo' : 'Selecionar tudo'}
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-sm">
        {invoices.map((invoice) => {
          const isOverdue = invoice.due_date < today;
          const statusConfig = PAYMENT_STATUS_CONFIG[invoice.status as PaymentStatus] || PAYMENT_STATUS_CONFIG.pending;
          const typeLabel = INVOICE_TYPE_CONFIG[invoice.type as InvoiceType]?.label || invoice.type;
          const isSelected = selectedIds.includes(invoice.id);

          return (
            <button
              key={invoice.id}
              onClick={() => toggleOne(invoice.id)}
              className={cn(
                'relative w-44 flex flex-col items-start gap-xs p-md rounded-3xl border text-left transition-all',
                isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-input-border bg-card-bg hover:border-primary/30',
                isOverdue && !isSelected && 'border-error/30 bg-error/5'
              )}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOne(invoice.id)}
                onClick={e => e.stopPropagation()}
                className="absolute top-3 right-3 w-4 h-4 rounded cursor-pointer accent-primary"
              />

              {/* Ícone */}
              <div className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center mb-xs',
                isOverdue ? 'bg-error/10' : 'bg-stone-100'
              )}>
                <FileText className={cn('w-5 h-5', isOverdue ? 'text-error' : 'text-primary')} />
              </div>

              {/* Tipo */}
              <p className="text-body font-bold text-primary leading-snug pr-5">{typeLabel}</p>

              {/* Referência */}
              {invoice.commission_date && (
                <p className="text-body text-secondary">{formatDate(invoice.commission_date)}</p>
              )}

              {/* Valor */}
              <p className={cn('text-title font-bold', isOverdue ? 'text-error' : 'text-primary')}>
                {formatCurrency(invoice.amount)}
              </p>

              {/* Vencimento */}
              <p className={cn('text-body', isOverdue ? 'text-error' : 'text-secondary')}>
                Venc. {formatDate(invoice.due_date)}
              </p>

              {/* Status */}
              <Badge variant={statusConfig.variant}>
                {statusConfig.label}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Footer com total e botão de pagar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-md bg-primary/5 border border-primary/20 rounded-2xl">
          <div>
            <p className="text-caption text-secondary">{selectedIds.length} fatura{selectedIds.length > 1 ? 's' : ''} selecionada{selectedIds.length > 1 ? 's' : ''}</p>
            <p className="text-body-lg font-bold text-primary">{formatCurrency(totalSelectedAmount)}</p>
          </div>
          <Button onClick={onPayClick}>
            Pagar selecionadas
          </Button>
        </div>
      )}
    </div>
  );
}
