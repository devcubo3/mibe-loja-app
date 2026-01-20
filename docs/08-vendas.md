# 08 - Histórico de Vendas

## Objetivo
Implementar listagem de vendas com filtros, busca e página de detalhes.

---

## Layout da Página de Listagem

```
┌─────────────────────────────────────────────────────────────┐
│  Histórico de Vendas                                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar por cliente ou CPF...                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Filtros:  [Todos ▼]  [Este mês ▼]  [Ordenar por ▼]        │
│                                                             │
│  Mostrando 127 vendas                        Total: R$ 15k  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 João Silva Santos                      15/01/2026  │ │
│  │    CPF: 123.456.789-00                      14:32     │ │
│  │    ─────────────────────────────────────────────────  │ │
│  │    Valor: R$ 150,00                                   │ │
│  │    Saldo usado: R$ 45,00    Pago: R$ 105,00           │ │
│  │    Cashback: +R$ 5,25                          →      │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Carregar mais]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Passo 1: Criar Componente SaleCard

Criar `src/components/sales/SaleCard.tsx`:

```tsx
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
            <Avatar name={sale.customer_name} size="md" />
            <div>
              <p className="font-semibold text-text-primary">
                {sale.customer_name}
              </p>
              <p className="text-caption text-text-secondary">
                CPF: {formatCPF(sale.customer_cpf)}
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
                {formatCurrency(sale.purchase_amount)}
              </span>
            </div>

            {sale.balance_used > 0 && (
              <div className="flex items-center gap-sm text-caption">
                <span className="text-text-muted">Saldo usado:</span>
                <span className="text-error">
                  -{formatCurrency(sale.balance_used)}
                </span>
                <span className="text-text-muted mx-1">•</span>
                <span className="text-text-muted">Pago:</span>
                <span>{formatCurrency(sale.amount_paid)}</span>
              </div>
            )}

            <div className="flex items-center gap-sm">
              <span className="text-body text-text-secondary">Cashback:</span>
              <Badge variant="success">
                +{formatCurrency(sale.cashback_generated)}
              </Badge>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-text-muted" />
        </div>
      </Card>
    </Link>
  );
}
```

---

## Passo 2: Criar Componente SalesList

Criar `src/components/sales/SalesList.tsx`:

```tsx
'use client';

import { SaleCard } from './SaleCard';
import { EmptyState, SkeletonCard, Button } from '@/components/ui';
import { Receipt } from 'lucide-react';
import type { Sale } from '@/types/sale';

interface SalesListProps {
  sales: Sale[];
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
```

---

## Passo 3: Criar Componente de Filtros

Criar `src/components/sales/SalesFilters.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SalesFilters {
  type: 'all' | 'with_cashback' | 'with_balance';
  period: 'today' | 'week' | 'month' | 'year' | 'all';
  sortBy: 'recent' | 'oldest' | 'highest' | 'lowest';
}

interface SalesFiltersProps {
  filters: SalesFilters;
  onChange: (filters: SalesFilters) => void;
}

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'with_cashback', label: 'Com cashback' },
  { value: 'with_balance', label: 'Com resgate' },
];

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
  { value: 'all', label: 'Todo período' },
];

const sortOptions = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'highest', label: 'Maior valor' },
  { value: 'lowest', label: 'Menor valor' },
];

export function SalesFilters({ filters, onChange }: SalesFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleChange = (key: keyof SalesFilters, value: string) => {
    onChange({ ...filters, [key]: value });
    setOpenDropdown(null);
  };

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.period !== 'month' ||
    filters.sortBy !== 'recent';

  const clearFilters = () => {
    onChange({
      type: 'all',
      period: 'month',
      sortBy: 'recent',
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-sm">
      {/* Type Filter */}
      <FilterDropdown
        label={typeOptions.find((o) => o.value === filters.type)?.label || 'Tipo'}
        options={typeOptions}
        value={filters.type}
        onChange={(value) => handleChange('type', value)}
        isOpen={openDropdown === 'type'}
        onToggle={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
      />

      {/* Period Filter */}
      <FilterDropdown
        label={periodOptions.find((o) => o.value === filters.period)?.label || 'Período'}
        options={periodOptions}
        value={filters.period}
        onChange={(value) => handleChange('period', value)}
        isOpen={openDropdown === 'period'}
        onToggle={() => setOpenDropdown(openDropdown === 'period' ? null : 'period')}
      />

      {/* Sort Filter */}
      <FilterDropdown
        label={sortOptions.find((o) => o.value === filters.sortBy)?.label || 'Ordenar'}
        options={sortOptions}
        value={filters.sortBy}
        onChange={(value) => handleChange('sortBy', value)}
        isOpen={openDropdown === 'sortBy'}
        onToggle={() => setOpenDropdown(openDropdown === 'sortBy' ? null : 'sortBy')}
      />

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 px-3 py-2 text-caption text-error hover:bg-error-light rounded-sm transition-colors"
        >
          <X className="w-3 h-3" />
          Limpar
        </button>
      )}
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
}: FilterDropdownProps) {
  const isDefault = value === options[0]?.value;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-2 text-body rounded-sm border transition-colors',
          isDefault
            ? 'bg-input-bg border-input-border hover:border-primary'
            : 'bg-primary border-primary text-white'
        )}
      >
        {label}
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-white border border-input-border rounded-md shadow-lg z-20 py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={cn(
                  'w-full px-4 py-2 text-left text-body hover:bg-input-bg transition-colors',
                  option.value === value && 'bg-input-bg font-medium'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Passo 4: Criar Página de Listagem

Criar `src/app/(dashboard)/vendas/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { SearchInput } from '@/components/ui';
import { SalesList } from '@/components/sales/SalesList';
import { SalesFilters, type SalesFilters as FiltersType } from '@/components/sales/SalesFilters';
import { formatCurrency } from '@/lib/formatters';
import type { Sale } from '@/types/sale';

const PAGE_SIZE = 20;

export default function SalesPage() {
  const { store } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FiltersType>({
    type: 'all',
    period: 'month',
    sortBy: 'recent',
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchSales = useCallback(
    async (pageNum = 0, append = false) => {
      if (!store?.id) return;

      if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        let query = supabase
          .from('sales')
          .select('*', { count: 'exact' })
          .eq('store_id', store.id)
          .eq('status', 'confirmed');

        // Filtro de busca
        if (search) {
          query = query.or(
            `customer_name.ilike.%${search}%,customer_cpf.ilike.%${search}%`
          );
        }

        // Filtro de tipo
        if (filters.type === 'with_cashback') {
          query = query.gt('cashback_generated', 0);
        } else if (filters.type === 'with_balance') {
          query = query.gt('balance_used', 0);
        }

        // Filtro de período
        const now = new Date();
        let startDate: Date | null = null;

        switch (filters.period) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }

        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }

        // Ordenação
        switch (filters.sortBy) {
          case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'highest':
            query = query.order('purchase_amount', { ascending: false });
            break;
          case 'lowest':
            query = query.order('purchase_amount', { ascending: true });
            break;
        }

        // Paginação
        query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        if (append) {
          setSales((prev) => [...prev, ...(data || [])]);
        } else {
          setSales(data || []);
        }

        setTotalCount(count || 0);
        setHasMore((data?.length || 0) === PAGE_SIZE);

        // Calcular total (apenas na primeira página)
        if (pageNum === 0 && data) {
          const total = data.reduce(
            (acc, sale) => acc + (sale.purchase_amount || 0),
            0
          );
          setTotalAmount(total);
        }
      } catch (error) {
        console.error('Erro ao buscar vendas:', error);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    },
    [store?.id, search, filters]
  );

  useEffect(() => {
    setPage(0);
    fetchSales(0);
  }, [fetchSales]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSales(nextPage, true);
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
```

---

## Passo 5: Criar Componente SaleDetail

Criar `src/components/sales/SaleDetail.tsx`:

```tsx
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
              <Avatar name={sale.customer_name} size="md" />
              <div>
                <p className="font-semibold">{sale.customer_name}</p>
                <p className="text-caption text-text-secondary">
                  CPF: {formatCPF(sale.customer_cpf)}
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
              value={formatCurrency(sale.purchase_amount)}
            />

            {sale.balance_used > 0 && (
              <DetailRow
                label="Saldo utilizado"
                value={`- ${formatCurrency(sale.balance_used)}`}
                valueClass="text-error"
              />
            )}

            <div className="h-px bg-input-border" />

            <DetailRow
              label="Valor pago pelo cliente"
              value={formatCurrency(sale.amount_paid)}
              bold
            />

            <div className="h-px bg-input-border" />

            <DetailRow
              label={`Cashback gerado (${sale.cashback_percentage}%)`}
              value={`+ ${formatCurrency(sale.cashback_generated)}`}
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
```

---

## Passo 6: Criar Página de Detalhes

Criar `src/app/(dashboard)/vendas/[id]/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { SaleDetail } from '@/components/sales/SaleDetail';
import { Skeleton } from '@/components/ui';
import type { Sale } from '@/types/sale';

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { store } = useAuth();
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      if (!store?.id || !params.id) return;

      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .eq('id', params.id)
          .eq('store_id', store.id)
          .single();

        if (error) throw error;

        if (!data) {
          setError('Venda não encontrada');
        } else {
          setSale(data);
        }
      } catch (err) {
        console.error('Erro ao buscar venda:', err);
        setError('Erro ao carregar dados da venda');
      }

      setIsLoading(false);
    };

    fetchSale();
  }, [store?.id, params.id]);

  return (
    <div className="page-container max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-md mb-lg">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-input-bg rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title font-bold">Detalhes da Venda</h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-lg">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-xl">
          <p className="text-body text-error mb-md">{error}</p>
          <Link href="/vendas" className="text-primary hover:underline">
            Voltar para vendas
          </Link>
        </div>
      )}

      {/* Sale Detail */}
      {sale && <SaleDetail sale={sale} />}
    </div>
  );
}
```

---

## Passo 7: Exportar Componentes

Criar `src/components/sales/index.ts`:

```typescript
export { SaleCard } from './SaleCard';
export { SalesList } from './SalesList';
export { SalesFilters } from './SalesFilters';
export type { SalesFilters as SalesFiltersType } from './SalesFilters';
export { SaleDetail } from './SaleDetail';
```

---

## Checklist

- [ ] SaleCard implementado
- [ ] SalesList com loading e empty state
- [ ] SalesFilters com dropdowns
- [ ] Página de listagem com busca e filtros
- [ ] Paginação com "Carregar mais"
- [ ] SaleDetail implementado
- [ ] Página de detalhes da venda
- [ ] Navegação funcionando

---

## Próximo Passo

Seguir para [09-clientes.md](./09-clientes.md) para implementar a listagem de clientes.
