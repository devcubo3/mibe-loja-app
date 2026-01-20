'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Avatar, Badge, Card } from '@/components/ui';
import {
  formatCPF,
  formatCurrency,
  formatDate,
  formatTime,
} from '@/lib/formatters';
import type { Sale } from '@/types/sale';

interface SaleCardProps {
  sale: Sale;
}

export function SaleCard({ sale }: SaleCardProps) {
  return (
    <Link href={`/vendas/${sale.id}`}>
      <Card
        variant="default"
        padding="md"
        hoverable
        className="hover:border-primary"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-md">
          <div className="flex items-center gap-md">
            <Avatar name={sale.customer_name || 'Cliente'} size="md" />
            <div>
              <p className="font-semibold text-text-primary">
                {sale.customer_name || 'Cliente'}
              </p>
              <p className="text-caption text-text-secondary">
                CPF: {formatCPF(sale.customer_cpf || '')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-body text-text-secondary">
              {formatDate(sale.created_at)}
            </p>
            <p className="text-caption text-text-muted">
              {formatTime(sale.created_at)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-input-border mb-md" />

        {/* Details */}
        <div className="flex items-end justify-between">
          <div className="space-y-xs">
            <div className="flex items-center gap-lg">
              <span className="text-body text-text-secondary">Valor:</span>
              <span className="font-semibold">
                {formatCurrency(sale.purchase_amount || 0)}
              </span>
            </div>

            {sale.balance_used && sale.balance_used > 0 && (
              <div className="flex items-center gap-sm text-caption">
                <span className="text-text-muted">Saldo usado:</span>
                <span className="text-error">
                  -{formatCurrency(sale.balance_used)}
                </span>
                <span className="text-text-muted mx-1">•</span>
                <span className="text-text-muted">Pago:</span>
                <span>{formatCurrency(sale.amount_paid || 0)}</span>
              </div>
            )}

            <div className="flex items-center gap-sm">
              <span className="text-body text-text-secondary">Cashback:</span>
              <Badge variant="success">
                +{formatCurrency(sale.cashback_generated || 0)}
              </Badge>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-text-muted" />
        </div>
      </Card>
    </Link>
  );
}
