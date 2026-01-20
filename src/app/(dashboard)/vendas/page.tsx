'use client';

import { useState, useEffect } from 'react';
import { useSales } from '@/hooks/useSales';
import { SearchInput } from '@/components/ui';
import { SalesList } from '@/components/sales/SalesList';
import { SalesFilters, type SalesFilters as FiltersType } from '@/components/sales/SalesFilters';
import { formatCurrency } from '@/lib/formatters';

export default function SalesPage() {
  const { 
    sales, 
    isLoading, 
    isLoadingMore, 
    totalCount, 
    totalAmount, 
    fetchSales 
  } = useSales();
  
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FiltersType>({
    type: 'all',
    period: 'month',
    sortBy: 'recent',
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchSales({ ...filters, search, page: 0 });
    setPage(0);
    setHasMore(sales.length < totalCount);
  }, [filters, search, fetchSales]);

  useEffect(() => {
    setHasMore(sales.length < totalCount);
  }, [sales, totalCount]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSales({ ...filters, search, page: nextPage, append: true });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-title font-bold">Histórico de Vendas</h1>
      </div>

      {/* Search */}
      <div className="mb-md">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por cliente ou CPF..."
        />
      </div>

      {/* Filters */}
      <div className="mb-md">
        <SalesFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Stats */}
      {!isLoading && sales.length > 0 && (
        <div className="flex items-center justify-between mb-md text-body text-text-secondary">
          <span>
            Mostrando {sales.length} de {totalCount} vendas
          </span>
          <span className="font-medium text-text-primary">
            Total: {formatCurrency(totalAmount)}
          </span>
        </div>
      )}

      {/* Sales List */}
      <SalesList
        sales={sales}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
}
