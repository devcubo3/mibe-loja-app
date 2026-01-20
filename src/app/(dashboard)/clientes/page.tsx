'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { SearchInput } from '@/components/ui';
import { CustomersList } from '@/components/customers/CustomersList';
import { cn } from '@/lib/utils';

type SortOption = 'recent' | 'oldest' | 'most_purchases' | 'highest_balance';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'most_purchases', label: 'Mais compras' },
  { value: 'highest_balance', label: 'Maior saldo' },
];

export default function CustomersPage() {
  const { customers, isLoading, isLoadingMore, totalCount, fetchCustomers } = useCustomers();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchCustomers({ search, sortBy, page: 0 });
    setPage(0);
  }, [search, sortBy, fetchCustomers]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCustomers({ search, sortBy, page: nextPage, append: true });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-title font-bold">Clientes</h1>
      </div>

      {/* Search */}
      <div className="mb-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou CPF..."
        />
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-md">
        <span className="text-body text-text-secondary">
          {totalCount} {totalCount === 1 ? 'cliente' : 'clientes'}
        </span>

        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-body bg-input-bg border border-input-border rounded-sm hover:border-primary transition-colors"
          >
            {sortOptions.find((o) => o.value === sortBy)?.label}
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                showSortDropdown && 'rotate-180'
              )}
            />
          </button>

          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortDropdown(false)}
              />
              <div className="absolute top-full right-0 mt-1 min-w-[160px] bg-white border border-input-border rounded-md shadow-lg z-20 py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-body hover:bg-input-bg transition-colors',
                      option.value === sortBy && 'bg-input-bg font-medium'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customers List */}
      <CustomersList
        customers={customers}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
}
