'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Avatar, Card } from '@/components/ui';
import { formatCPF, formatCurrency, formatDate } from '@/lib/formatters';
import type { CustomerWithBalance } from '@/types/customer';

interface CustomerCardProps {
  customer: CustomerWithBalance;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const { storeBalance } = customer;

  return (
    <Link href={`/clientes/${customer.id}`}>
      <Card
        variant="default"
        padding="md"
        hoverable
        className="hover:border-primary"
      >
        {/* Header */}
        <div className="flex items-center gap-md mb-md">
          <Avatar name={customer.full_name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {customer.full_name}
            </p>
            <p className="text-caption text-text-secondary">
              CPF: {formatCPF(customer.cpf)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="text-caption text-text-secondary mb-md">
          <span>{storeBalance?.total_purchases || 0} compras</span>
          {storeBalance?.last_purchase_date && (
            <>
              <span className="mx-1">•</span>
              <span>Última: {formatDate(storeBalance.last_purchase_date)}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-input-border mb-md" />

        {/* Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="text-body text-text-secondary">Saldo:</span>
            <span
              className={`font-semibold ${
                (storeBalance?.balance || 0) > 0
                  ? 'text-success'
                  : 'text-text-primary'
              }`}
            >
              {formatCurrency(storeBalance?.balance || 0)}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted" />
        </div>
      </Card>
    </Link>
  );
}
