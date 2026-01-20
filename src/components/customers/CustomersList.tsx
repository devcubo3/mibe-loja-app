'use client';

import { CustomerCard } from './CustomerCard';
import { EmptyState, SkeletonCard, Button } from '@/components/ui';
import { Users } from 'lucide-react';
import type { CustomerWithBalance } from '@/types/customer';

interface CustomersListProps {
  customers: CustomerWithBalance[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function CustomersList({
  customers,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: CustomersListProps) {
  if (isLoading) {
    return (
      <div className="space-y-md">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-8 h-8" />}
        title="Nenhum cliente encontrado"
        description="Não há clientes que compraram na sua loja ainda"
      />
    );
  }

  return (
    <div className="space-y-md">
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
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
