'use client';

import Link from 'next/link';
import { Avatar, Badge, Card, Button } from '@/components/ui';
import {
  formatCPF,
  formatCurrency,
  formatDateTime,
} from '@/lib/formatters';
import { User } from 'lucide-react';
import type { Sale } from '@/types/sale';

interface SaleDetailProps {
  sale: Sale;
}

export function SaleDetail({ sale }: SaleDetailProps) {
  return (
    <div className="space-y-lg">
      {/* Header Card */}
      <Card variant="highlight" padding="lg" className="text-center">
        <p className="text-body text-white/70 mb-xs">VENDA #{sale.id.slice(-8).toUpperCase()}</p>
        <p className="text-body text-white/90 mb-md">
          {formatDateTime(sale.created_at)}
        </p>
        <Badge variant="success">Confirmada</Badge>
      </Card>

      {/* Customer Card */}
      <div>
        <h2 className="section-title mb-md">Cliente</h2>
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <Avatar name={sale.customer_name || 'Cliente'} size="md" />
              <div>
                <p className="font-semibold">{sale.customer_name || 'Cliente'}</p>
                <p className="text-caption text-text-secondary">
                  CPF: {formatCPF(sale.customer_cpf || '')}
                </p>
              </div>
            </div>
            <Link href={`/clientes/${sale.customer_id}`}>
              <Button variant="ghost" size="sm" icon={<User className="w-4 h-4" />}>
                Ver perfil
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Transaction Details */}
      <div>
        <h2 className="section-title mb-md">Detalhes da transação</h2>
        <Card variant="default" padding="md">
          <div className="space-y-md">
            <DetailRow
              label="Valor da compra"
              value={formatCurrency(sale.purchase_amount || 0)}
            />

            {sale.balance_used && sale.balance_used > 0 && (
              <DetailRow
                label="Saldo utilizado"
                value={`- ${formatCurrency(sale.balance_used)}`}
                valueClass="text-error"
              />
            )}

            <div className="h-px bg-input-border" />

            <DetailRow
              label="Valor pago pelo cliente"
              value={formatCurrency(sale.amount_paid || 0)}
              bold
            />

            <div className="h-px bg-input-border" />

            <DetailRow
              label={`Cashback gerado (${sale.cashback_percentage}%)`}
              value={`+ ${formatCurrency(sale.cashback_generated || 0)}`}
              valueClass="text-success"
            />
          </div>
        </Card>
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
    <div className="flex items-center justify-between">
      <span className="text-body text-text-secondary">{label}</span>
      <span
        className={`text-body ${bold ? 'font-semibold text-body-lg' : ''} ${valueClass || ''}`}
      >
        {value}
      </span>
    </div>
  );
}
