'use client';

import Link from 'next/link';
import { Avatar, Badge, Card, Button } from '@/components/ui';
import {
  formatCurrency,
  formatDateTime,
} from '@/lib/formatters';
import { User, Banknote, QrCode, CreditCard, AlertCircle } from 'lucide-react';
import type { SaleWithCustomer, PaymentMethodType } from '@/types/sale';

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, { label: string; icon: React.ReactNode }> = {
  dinheiro: { label: 'Dinheiro', icon: <Banknote className="w-4 h-4" /> },
  pix: { label: 'PIX', icon: <QrCode className="w-4 h-4" /> },
  credito: { label: 'Cartão de Crédito', icon: <CreditCard className="w-4 h-4" /> },
  debito: { label: 'Cartão de Débito', icon: <CreditCard className="w-4 h-4" /> },
  expirado: { label: 'Saldo Expirado', icon: <AlertCircle className="w-4 h-4 text-warning" /> }
};

interface SaleDetailProps {
  sale: SaleWithCustomer;
}

export function SaleDetail({ sale }: SaleDetailProps) {
  // Calcular porcentagem de cashback baseado nos valores
  const baseAmount = sale.total_amount - sale.cashback_redeemed;
  const cashbackPercentage = baseAmount > 0 
    ? Math.round((sale.cashback_earned / baseAmount) * 100) 
    : 0;

  return (
    <div className="space-y-lg">
      {/* Header Card */}
      <Card variant="highlight" padding="lg" className="text-center">
        <p className="text-body text-white/70 mb-xs">VENDA #{sale.id.slice(-8).toUpperCase()}</p>
        <p className="text-body text-white/90 mb-md">
          {sale.created_at ? formatDateTime(sale.created_at) : '—'}
        </p>
        <Badge variant={sale.payment_method === 'expirado' ? 'warning' : 'success'}>
          {sale.payment_method === 'expirado' ? 'Expirada' : 'Confirmada'}
        </Badge>
      </Card>

      {/* Customer Card */}
      <div>
        <h2 className="section-title mb-md">Cliente</h2>
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <Avatar name={sale.customer?.full_name || 'Cliente'} size="md" src={sale.customer?.avatar_url || undefined} />
              <div>
                <p className="font-semibold">{sale.customer?.full_name || 'Cliente'}</p>
              </div>
            </div>
            {sale.customer?.id && (
              <Link href={`/clientes/${sale.customer.id}`}>
                <Button variant="ghost" size="sm" icon={<User className="w-4 h-4" />}>
                  Ver perfil
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>

      {/* Transaction Details */}
      <div>
        <h2 className="section-title mb-md">Detalhes da transação</h2>
        <Card variant="default" padding="md">
          <div className="space-y-md">
            {sale.payment_method !== 'expirado' && (
              <DetailRow
                label="Valor da compra"
                value={formatCurrency(sale.total_amount || 0)}
              />
            )}

            {sale.cashback_redeemed > 0 && (
              <DetailRow
                label={sale.payment_method === 'expirado' ? "Valor Expirado" : "Saldo utilizado"}
                value={`- ${formatCurrency(sale.cashback_redeemed)}`}
                valueClass="text-error"
              />
            )}

            <div className="h-px bg-input-border" />

            {sale.payment_method !== 'expirado' && (
              <>
                <div className="h-px bg-input-border" />
                <DetailRow
                  label="Valor pago pelo cliente"
                  value={formatCurrency(sale.net_amount_paid || 0)}
                  bold
                />
                <div className="h-px bg-input-border" />
                <DetailRow
                  label={`Cashback gerado (${cashbackPercentage}%)`}
                  value={`+ ${formatCurrency(sale.cashback_earned || 0)}`}
                  valueClass="text-success"
                />
              </>
            )}

            <div className="h-px bg-input-border" />

            <div className="flex items-center justify-between">
              <span className="text-body text-text-secondary">Forma de pagamento</span>
              <span className="flex items-center gap-xs text-body font-medium">
                {PAYMENT_METHOD_LABELS[sale.payment_method || 'dinheiro']?.icon}
                {PAYMENT_METHOD_LABELS[sale.payment_method || 'dinheiro']?.label || 'Dinheiro'}
              </span>
            </div>
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
