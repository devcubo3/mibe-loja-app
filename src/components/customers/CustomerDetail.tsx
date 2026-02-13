'use client';

import Link from 'next/link';
import { Lock, AlertCircle, ChevronRight } from 'lucide-react';
import { Avatar, Badge, Card } from '@/components/ui';
import {
  formatCPF,
  formatCurrency,
  formatDate,
  formatPhone,
} from '@/lib/formatters';
import type { CustomerWithBalance } from '@/types/customer';
import type { SaleWithCustomer } from '@/types/sale';

interface CustomerDetailProps {
  customer: CustomerWithBalance;
  recentSales: SaleWithCustomer[];
}

export function CustomerDetail({ customer, recentSales }: CustomerDetailProps) {
  const { storeBalance } = customer;

  return (
    <div className="space-y-lg">
      {/* Warning */}
      <div className="flex items-start gap-sm text-text-secondary bg-warning-light rounded-md p-md">
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <p className="text-body">
          Visualização apenas - Dados não editáveis
        </p>
      </div>

      {/* Customer Info Card */}
      <Card variant="default" padding="none">
        {/* Header with Avatar */}
        <div className="bg-primary px-lg py-lg flex items-center gap-md rounded-t-md">
          <Avatar name={customer.full_name} size="lg" />
          <div>
            <p className="text-body-lg font-semibold text-white">
              {customer.full_name}
            </p>
            <Badge variant="light">{formatCPF(customer.cpf)}</Badge>
          </div>
        </div>

        {/* Info Fields */}
        <div className="p-lg space-y-md">
          <InfoField label="Nome completo" value={customer.full_name} />
          <InfoField label="CPF" value={formatCPF(customer.cpf)} />
          {customer.birth_date && (
            <InfoField
              label="Data de Nascimento"
              value={formatDate(customer.birth_date)}
            />
          )}
          {customer.phone && (
            <InfoField label="Telefone" value={formatPhone(customer.phone)} />
          )}
        </div>
      </Card>

      {/* Store Stats */}
      <div>
        <h2 className="section-title mb-md">Resumo com sua loja</h2>
        <Card variant="default" padding="md">
          <div className="space-y-md">
            <StatRow
              label="Total de compras"
              value={storeBalance?.total_purchases?.toString() || '0'}
            />
            <StatRow
              label="Total gasto"
              value={formatCurrency(storeBalance?.total_spent || 0)}
            />
            <StatRow
              label="Cashback recebido"
              value={formatCurrency(storeBalance?.total_cashback || 0)}
              valueClass="text-success"
            />
            <div className="h-px bg-input-border" />
            <StatRow
              label="Saldo atual"
              value={formatCurrency(storeBalance?.balance || 0)}
              valueClass="text-success font-bold"
              bold
            />
            {storeBalance?.last_purchase_date && (
              <StatRow
                label="Última compra"
                value={formatDate(storeBalance.last_purchase_date)}
                valueClass="text-text-secondary"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Recent Purchases */}
      {recentSales.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-md">
            <h2 className="section-title">Histórico de compras</h2>
            <Link
              href={`/vendas?customer=${customer.id}`}
              className="text-body text-primary font-medium hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          <Card variant="default" padding="none">
            {recentSales.map((sale, index) => (
              <Link key={sale.id} href={`/vendas/${sale.id}`}>
                <div
                  className={`flex items-center justify-between p-md hover:bg-input-bg transition-colors ${
                    index > 0 ? 'border-t border-input-border' : ''
                  }`}
                >
                  <div>
                    <p className="text-body">{formatDate(sale.created_at || '')}</p>
                    <p className="text-caption text-text-secondary">
                      {formatCurrency(sale.total_amount || 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-sm">
                    {sale.cashback_redeemed && sale.cashback_redeemed > 0 ? (
                      <span className="text-error">
                        -{formatCurrency(sale.cashback_redeemed)}
                      </span>
                    ) : (
                      <span className="text-success">
                        +{formatCurrency(sale.cashback_earned || 0)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </div>
              </Link>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-input-border pb-sm last:border-0 last:pb-0">
      <p className="text-caption text-text-muted mb-xs">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-body-lg text-text-primary">{value}</p>
        <Lock className="w-4 h-4 text-text-muted" />
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  valueClass,
  bold,
}: {
  label: string;
  value: string;
  valueClass?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body text-text-secondary">{label}</span>
      <span className={`text-body ${bold ? 'text-body-lg' : ''} ${valueClass || ''}`}>
        {value}
      </span>
    </div>
  );
}
