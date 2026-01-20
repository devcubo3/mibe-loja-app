# 09 - Clientes

## Objetivo
Implementar listagem de clientes com busca e página de detalhes (somente leitura).

---

## Layout da Página de Listagem

```
┌─────────────────────────────────────────────────────────────┐
│  Clientes                                                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar por nome ou CPF...                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Ordenar:  [Mais recentes ▼]                                │
│                                                             │
│  127 clientes                                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 João Silva Santos                                  │ │
│  │    CPF: 123.456.789-00                                │ │
│  │    12 compras • Última: 15/01/2026                    │ │
│  │    ─────────────────────────────────────────────────  │ │
│  │    Saldo: R$ 45,00                              →     │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Passo 1: Criar Componente CustomerCard

Criar `src/components/customers/CustomerCard.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Avatar, Badge, Card } from '@/components/ui';
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
          <Avatar name={customer.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {customer.name}
            </p>
            <p className="text-caption text-text-secondary">
              CPF: {formatCPF(customer.cpf)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="text-caption text-text-secondary mb-md">
          <span>{storeBalance?.total_purchases || 0} compras</span>
          {storeBalance?.last_purchase && (
            <>
              <span className="mx-1">•</span>
              <span>Última: {formatDate(storeBalance.last_purchase)}</span>
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
```

---

## Passo 2: Criar Componente CustomersList

Criar `src/components/customers/CustomersList.tsx`:

```tsx
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
```

---

## Passo 3: Criar Página de Listagem

Criar `src/app/(dashboard)/clientes/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { SearchInput } from '@/components/ui';
import { CustomersList } from '@/components/customers/CustomersList';
import { cn } from '@/lib/utils';
import type { CustomerWithBalance } from '@/types/customer';

const PAGE_SIZE = 20;

type SortOption = 'recent' | 'oldest' | 'most_purchases' | 'highest_balance';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'most_purchases', label: 'Mais compras' },
  { value: 'highest_balance', label: 'Maior saldo' },
];

export default function CustomersPage() {
  const { store } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = useCallback(
    async (pageNum = 0, append = false) => {
      if (!store?.id) return;

      if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        // Primeiro, buscar os IDs dos clientes que têm saldo na loja
        let balanceQuery = supabase
          .from('customer_balances')
          .select('customer_id, balance, total_purchases, total_spent, total_cashback, last_purchase')
          .eq('store_id', store.id);

        // Ordenação
        switch (sortBy) {
          case 'recent':
            balanceQuery = balanceQuery.order('last_purchase', {
              ascending: false,
              nullsFirst: false,
            });
            break;
          case 'oldest':
            balanceQuery = balanceQuery.order('last_purchase', {
              ascending: true,
              nullsFirst: true,
            });
            break;
          case 'most_purchases':
            balanceQuery = balanceQuery.order('total_purchases', {
              ascending: false,
            });
            break;
          case 'highest_balance':
            balanceQuery = balanceQuery.order('balance', { ascending: false });
            break;
        }

        const { data: balances, error: balanceError } = await balanceQuery;

        if (balanceError) throw balanceError;

        if (!balances || balances.length === 0) {
          setCustomers([]);
          setTotalCount(0);
          setHasMore(false);
          setIsLoading(false);
          return;
        }

        // Buscar dados dos clientes
        const customerIds = balances.map((b) => b.customer_id);

        let customersQuery = supabase
          .from('customers')
          .select('*', { count: 'exact' })
          .in('id', customerIds);

        // Filtro de busca
        if (search) {
          customersQuery = customersQuery.or(
            `name.ilike.%${search}%,cpf.ilike.%${search}%`
          );
        }

        // Paginação
        customersQuery = customersQuery.range(
          pageNum * PAGE_SIZE,
          (pageNum + 1) * PAGE_SIZE - 1
        );

        const { data: customersData, error: customersError, count } =
          await customersQuery;

        if (customersError) throw customersError;

        // Combinar dados
        const customersWithBalance: CustomerWithBalance[] = (
          customersData || []
        ).map((customer) => {
          const balance = balances.find(
            (b) => b.customer_id === customer.id
          );
          return {
            ...customer,
            storeBalance: {
              customer_id: customer.id,
              store_id: store.id,
              balance: balance?.balance || 0,
              total_purchases: balance?.total_purchases || 0,
              total_spent: balance?.total_spent || 0,
              total_cashback: balance?.total_cashback || 0,
              last_purchase: balance?.last_purchase,
            },
          };
        });

        // Reordenar conforme o sortBy (já que a query de clientes pode ter alterado a ordem)
        customersWithBalance.sort((a, b) => {
          switch (sortBy) {
            case 'recent':
              return (
                new Date(b.storeBalance?.last_purchase || 0).getTime() -
                new Date(a.storeBalance?.last_purchase || 0).getTime()
              );
            case 'oldest':
              return (
                new Date(a.storeBalance?.last_purchase || 0).getTime() -
                new Date(b.storeBalance?.last_purchase || 0).getTime()
              );
            case 'most_purchases':
              return (
                (b.storeBalance?.total_purchases || 0) -
                (a.storeBalance?.total_purchases || 0)
              );
            case 'highest_balance':
              return (
                (b.storeBalance?.balance || 0) -
                (a.storeBalance?.balance || 0)
              );
            default:
              return 0;
          }
        });

        if (append) {
          setCustomers((prev) => [...prev, ...customersWithBalance]);
        } else {
          setCustomers(customersWithBalance);
        }

        setTotalCount(count || 0);
        setHasMore((customersData?.length || 0) === PAGE_SIZE);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    },
    [store?.id, search, sortBy]
  );

  useEffect(() => {
    setPage(0);
    fetchCustomers(0);
  }, [fetchCustomers]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCustomers(nextPage, true);
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
```

---

## Passo 4: Criar Componente CustomerDetail

Criar `src/components/customers/CustomerDetail.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { Lock, AlertCircle, ChevronRight } from 'lucide-react';
import { Avatar, Badge, Card } from '@/components/ui';
import {
  formatCPF,
  formatCurrency,
  formatDate,
} from '@/lib/formatters';
import type { CustomerWithBalance } from '@/types/customer';
import type { Sale } from '@/types/sale';

interface CustomerDetailProps {
  customer: CustomerWithBalance;
  recentSales: Sale[];
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
          <Avatar name={customer.name} size="lg" />
          <div>
            <p className="text-body-lg font-semibold text-white">
              {customer.name}
            </p>
            <Badge variant="light">{formatCPF(customer.cpf)}</Badge>
          </div>
        </div>

        {/* Info Fields */}
        <div className="p-lg space-y-md">
          <InfoField label="Nome completo" value={customer.name} />
          <InfoField label="CPF" value={formatCPF(customer.cpf)} />
          {customer.birth_date && (
            <InfoField
              label="Data de Nascimento"
              value={formatDate(customer.birth_date)}
            />
          )}
          {customer.email && (
            <InfoField label="E-mail" value={customer.email} />
          )}
          {customer.phone && (
            <InfoField label="Telefone" value={customer.phone} />
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
            {storeBalance?.last_purchase && (
              <StatRow
                label="Última compra"
                value={formatDate(storeBalance.last_purchase)}
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
                    <p className="text-body">{formatDate(sale.created_at)}</p>
                    <p className="text-caption text-text-secondary">
                      {formatCurrency(sale.purchase_amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-sm">
                    {sale.balance_used > 0 ? (
                      <span className="text-error">
                        -{formatCurrency(sale.balance_used)}
                      </span>
                    ) : (
                      <span className="text-success">
                        +{formatCurrency(sale.cashback_generated)}
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
```

---

## Passo 5: Criar Página de Detalhes

Criar `src/app/(dashboard)/clientes/[id]/page.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { CustomerDetail } from '@/components/customers/CustomerDetail';
import { Skeleton } from '@/components/ui';
import type { CustomerWithBalance } from '@/types/customer';
import type { Sale } from '@/types/sale';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { store } = useAuth();
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!store?.id || !params.id) return;

      try {
        // Buscar cliente
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', params.id)
          .single();

        if (customerError) throw customerError;

        if (!customerData) {
          setError('Cliente não encontrado');
          setIsLoading(false);
          return;
        }

        // Buscar saldo do cliente na loja
        const { data: balanceData } = await supabase
          .from('customer_balances')
          .select('*')
          .eq('customer_id', params.id)
          .eq('store_id', store.id)
          .single();

        const customerWithBalance: CustomerWithBalance = {
          ...customerData,
          storeBalance: balanceData || {
            customer_id: customerData.id,
            store_id: store.id,
            balance: 0,
            total_purchases: 0,
            total_spent: 0,
            total_cashback: 0,
          },
        };

        setCustomer(customerWithBalance);

        // Buscar vendas recentes deste cliente
        const { data: salesData } = await supabase
          .from('sales')
          .select('*')
          .eq('store_id', store.id)
          .eq('customer_id', params.id)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentSales(salesData || []);
      } catch (err) {
        console.error('Erro ao buscar cliente:', err);
        setError('Erro ao carregar dados do cliente');
      }

      setIsLoading(false);
    };

    fetchCustomer();
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
        <h1 className="text-title font-bold">Perfil do Cliente</h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-lg">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-xl">
          <p className="text-body text-error mb-md">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline"
          >
            Voltar
          </button>
        </div>
      )}

      {/* Customer Detail */}
      {customer && (
        <CustomerDetail customer={customer} recentSales={recentSales} />
      )}
    </div>
  );
}
```

---

## Passo 6: Exportar Componentes

Criar `src/components/customers/index.ts`:

```typescript
export { CustomerCard } from './CustomerCard';
export { CustomersList } from './CustomersList';
export { CustomerDetail } from './CustomerDetail';
```

---

## Checklist

- [ ] CustomerCard implementado
- [ ] CustomersList com loading e empty state
- [ ] Página de listagem com busca e ordenação
- [ ] CustomerDetail com dados somente leitura
- [ ] Página de detalhes do cliente
- [ ] Histórico de compras do cliente
- [ ] Indicadores visuais de "somente leitura" (cadeados)

---

## Próximo Passo

Seguir para [10-empresa.md](./10-empresa.md) para implementar a página de dados da empresa.
