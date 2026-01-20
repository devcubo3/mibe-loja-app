import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Avatar, EmptyState } from '@/components/ui';
import { formatCurrency, formatTime } from '@/lib/formatters';
import { SaleWithCustomer } from '@/types/sale';
import { Receipt } from 'lucide-react';

interface RecentSalesProps {
  sales: SaleWithCustomer[];
  isLoading?: boolean;
}

export function RecentSales({ sales, isLoading }: RecentSalesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-md">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-md animate-pulse">
                <div className="w-10 h-10 bg-surface-secondary rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-secondary rounded w-3/4" />
                  <div className="h-3 bg-surface-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Receipt className="w-8 h-8" />}
            title="Nenhuma venda registrada"
            description="Registre sua primeira venda para começar"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-md">
          {sales.map((sale) => (
            <Link
              key={sale.id}
              href={`/vendas/${sale.id}`}
              className="flex items-center gap-md p-sm -mx-sm rounded-sm hover:bg-surface-secondary transition-colors"
            >
              <Avatar name={sale.customer.name} />
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium truncate">
                  {sale.customer.name}
                </p>
                <p className="text-caption text-text-muted">
                  {formatTime(sale.created_at)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-body font-semibold">
                  {formatCurrency(sale.amount)}
                </p>
                <p className="text-caption text-success">
                  +{formatCurrency(sale.cashback_amount)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {sales.length > 0 && (
          <div className="mt-md pt-md border-t border-divider">
            <Link
              href="/vendas"
              className="text-body text-primary hover:underline font-medium"
            >
              Ver todas as vendas →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
