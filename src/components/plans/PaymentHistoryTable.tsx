'use client';

import { Receipt } from 'lucide-react';
import { Card, CardContent, Badge, EmptyState } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { PaymentRecord, PaymentStatus } from '@/types/plan';
import { PAYMENT_STATUS_CONFIG } from '@/types/plan';

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
    <>
      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-input-border">
              <th className="text-left text-caption text-secondary font-medium py-sm px-md">Vencimento</th>
              <th className="text-right text-caption text-secondary font-medium py-sm px-md">Base</th>
              <th className="text-right text-caption text-secondary font-medium py-sm px-md">Excedente</th>
              <th className="text-right text-caption text-secondary font-medium py-sm px-md">Total</th>
              <th className="text-center text-caption text-secondary font-medium py-sm px-md">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const statusConfig = PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus] || PAYMENT_STATUS_CONFIG.pending;
              return (
                <tr key={payment.id} className="border-b border-input-border last:border-0">
                  <td className="py-md px-md text-body text-primary">{formatDate(payment.due_date)}</td>
                  <td className="py-md px-md text-body text-primary text-right">{formatCurrency(payment.base_amount)}</td>
                  <td className="py-md px-md text-body text-secondary text-right">
                    {payment.excess_amount > 0 ? formatCurrency(payment.excess_amount) : '—'}
                  </td>
                  <td className="py-md px-md text-body font-semibold text-primary text-right">{formatCurrency(payment.amount)}</td>
                  <td className="py-md px-md text-center">
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-sm">
        {payments.map((payment) => {
          const statusConfig = PAYMENT_STATUS_CONFIG[payment.status as PaymentStatus] || PAYMENT_STATUS_CONFIG.pending;
          return (
            <Card key={payment.id} variant="outlined">
              <CardContent className="p-md">
                <div className="flex items-center justify-between mb-sm">
                  <span className="text-body text-secondary">{formatDate(payment.due_date)}</span>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-caption text-secondary">
                    {formatCurrency(payment.base_amount)}
                    {payment.excess_amount > 0 && (
                      <span className="text-error"> + {formatCurrency(payment.excess_amount)}</span>
                    )}
                  </div>
                  <span className="text-body-lg font-semibold text-primary">{formatCurrency(payment.amount)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
