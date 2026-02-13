'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import type { SaleWithCustomer } from '@/types/sale';

interface SaleConfirmationProps {
  sale: SaleWithCustomer;
  onNewSale: () => void;
}

export function SaleConfirmation({ sale, onNewSale }: SaleConfirmationProps) {
  return (
    <div className="text-center space-y-lg">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-success" />
      </div>

      {/* Title */}
      <div>
        <h1 className="text-title font-bold mb-xs">Venda registrada!</h1>
        <p className="text-body text-text-secondary">
          A venda foi registrada com sucesso
        </p>
      </div>

      {/* Sale Details */}
      <Card variant="filled" padding="lg">
        <div className="space-y-sm text-left">
          <DetailRow label="Cliente" value={sale.customer?.full_name || '-'} />
          <DetailRow
            label="Valor da compra"
            value={formatCurrency(sale.total_amount || 0)}
          />
          {sale.cashback_redeemed > 0 && (
            <DetailRow
              label="Saldo usado"
              value={`- ${formatCurrency(sale.cashback_redeemed)}`}
              valueClass="text-error"
            />
          )}
          <DetailRow
            label="Valor pago"
            value={formatCurrency(sale.net_amount_paid || 0)}
            bold
          />
          <DetailRow
            label="Cashback gerado"
            value={`+ ${formatCurrency(sale.cashback_earned || 0)}`}
            valueClass="text-success"
          />
          <DetailRow
            label="Data"
            value={sale.created_at ? formatDateTime(sale.created_at) : '-'}
            valueClass="text-text-secondary"
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-sm">
        <Button onClick={onNewSale} fullWidth>
          Nova Venda
        </Button>
        <Link href="/">
          <Button variant="secondary" fullWidth>
            Voltar para o Início
          </Button>
        </Link>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-body text-text-secondary">{label}</span>
      <span
        className={`text-body ${bold ? 'font-semibold' : ''} ${valueClass || ''}`}
      >
        {value}
      </span>
    </div>
  );
}
