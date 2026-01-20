'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import type { Sale } from '@/types/sale';

interface SaleConfirmationProps {
  sale: Sale;
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
          <DetailRow label="Cliente" value={sale.customer_name || '-'} />
          <DetailRow
            label="Valor da compra"
            value={formatCurrency(sale.purchase_amount || 0)}
          />
          {sale.balance_used && sale.balance_used > 0 && (
            <DetailRow
              label="Saldo usado"
              value={`- ${formatCurrency(sale.balance_used)}`}
              valueClass="text-error"
            />
          )}
          <DetailRow
            label="Valor pago"
            value={formatCurrency(sale.amount_paid || 0)}
            bold
          />
          <DetailRow
            label="Cashback gerado"
            value={`+ ${formatCurrency(sale.cashback_generated || 0)}`}
            valueClass="text-success"
          />
          <DetailRow
            label="Data"
            value={formatDateTime(sale.created_at)}
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
