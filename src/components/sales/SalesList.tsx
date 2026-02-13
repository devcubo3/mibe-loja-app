'use client';

import { SaleCard } from './SaleCard';
import { EmptyState, SkeletonCard, Button } from '@/components/ui';
import { Receipt } from 'lucide-react';
import type { SaleWithCustomer } from '@/types/sale';

interface SalesListProps {
  sales: SaleWithCustomer[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function SalesList({
  sales,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: SalesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-md">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="w-8 h-8" />}
        title="Nenhuma venda encontrada"
        description="Não há vendas registradas com os filtros selecionados"
      />
    );
  }

  return (
    <div className="space-y-md">
      {sales.map((sale) => (
        <SaleCard key={sale.id} sale={sale} />
      ))}

      {hasMore && (
        <div className="text-center pt-md">
          <Button
            variant="secondary"
            onClick={onLoadMore}
            loading={isLoadingMore}
          >
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
