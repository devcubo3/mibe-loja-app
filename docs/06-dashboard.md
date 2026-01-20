# 06 - Dashboard / Home

## Objetivo
Implementar a página inicial com métricas, ação rápida de registrar venda e vendas recentes.

---

## Layout da Página

```
┌─────────────────────────────────────────────────────────────┐
│  Bom dia, [Nome da Empresa]!                                │
│  Aqui está o resumo do seu dia                              │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Vendas Hoje │ │ Receita Hoje│ │ Cashback    │           │
│  │    12       │ │ R$ 2.450,00 │ │ R$ 122,50   │           │
│  │  ↑ 20%      │ │  ↑ 15%      │ │ Distribuído │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 REGISTRAR NOVA VENDA                  │  │
│  │      [Ícone QR Code grande] ou [Digite o CPF]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Últimas vendas                              Ver todas →    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 João Silva • 14:32 • R$ 150,00 • +R$ 7,50        │  │
│  │ 👤 Maria Santos • 13:45 • R$ 89,00 • +R$ 4,45       │  │
│  │ 👤 Pedro Costa • 11:20 • R$ 320,00 • +R$ 16,00      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Passo 1: Criar Tipos de Venda

Criar `src/types/sale.ts`:

```typescript
export interface Sale {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_cpf: string;
  purchase_amount: number;
  balance_used: number;
  amount_paid: number;
  cashback_generated: number;
  cashback_percentage: number;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface SaleWithCustomer extends Sale {
  customer: {
    id: string;
    name: string;
    cpf: string;
  };
}

export interface DashboardStats {
  salesToday: number;
  salesYesterday: number;
  revenueToday: number;
  revenueYesterday: number;
  cashbackToday: number;
  customersToday: number;
}
```

---

## Passo 2: Criar Componente StatCard

Criar `src/components/dashboard/StatCard.tsx`:

```tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  variant?: 'default' | 'highlight';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-md p-lg',
        variant === 'default'
          ? 'bg-white border border-input-border'
          : 'bg-primary text-white',
        className
      )}
    >
      <div className="flex items-start justify-between mb-sm">
        <p
          className={cn(
            'text-caption uppercase tracking-wider font-medium',
            variant === 'default' ? 'text-text-secondary' : 'text-white/70'
          )}
        >
          {title}
        </p>
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-md flex items-center justify-center',
              variant === 'default' ? 'bg-input-bg' : 'bg-white/10'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <p
        className={cn(
          'text-title font-bold',
          variant === 'default' ? 'text-text-primary' : 'text-white'
        )}
      >
        {value}
      </p>

      {(subtitle || trend) && (
        <div className="flex items-center gap-sm mt-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-caption font-medium',
                trend.isPositive ? 'text-success' : 'text-error'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && (
            <span
              className={cn(
                'text-caption',
                variant === 'default' ? 'text-text-muted' : 'text-white/60'
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Passo 3: Criar Componente QuickAction

Criar `src/components/dashboard/QuickActions.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { QrCode, Keyboard } from 'lucide-react';

export function QuickActions() {
  return (
    <Link href="/registrar-venda">
      <div className="card-highlight p-xl cursor-pointer hover:bg-[#2a2a2a] transition-colors group">
        <div className="flex flex-col md:flex-row items-center justify-center gap-lg text-center md:text-left">
          {/* Icon */}
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <QrCode className="w-10 h-10 text-white" />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-subtitle font-bold text-white mb-xs">
              Registrar Nova Venda
            </h2>
            <p className="text-body text-white/70 flex items-center justify-center md:justify-start gap-2">
              <span>Escaneie o QR Code</span>
              <span className="text-white/40">ou</span>
              <span className="inline-flex items-center gap-1">
                <Keyboard className="w-4 h-4" />
                Digite o CPF
              </span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

---

## Passo 4: Criar Componente RecentSales

Criar `src/components/dashboard/RecentSales.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Avatar, Skeleton } from '@/components/ui';
import { formatCurrency, formatTime } from '@/lib/formatters';
import type { Sale } from '@/types/sale';

interface RecentSalesProps {
  sales: Sale[];
  isLoading?: boolean;
}

export function RecentSales({ sales, isLoading }: RecentSalesProps) {
  if (isLoading) {
    return (
      <div className="space-y-sm">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-default flex items-center gap-md">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="card-filled text-center py-xl">
        <p className="text-body text-text-secondary">
          Nenhuma venda registrada hoje
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {sales.map((sale) => (
        <Link key={sale.id} href={`/vendas/${sale.id}`}>
          <div className="card-default flex items-center gap-md hover:border-primary transition-colors cursor-pointer">
            {/* Avatar */}
            <Avatar name={sale.customer_name} size="md" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary truncate">
                {sale.customer_name}
              </p>
              <p className="text-caption text-text-secondary">
                {formatTime(new Date(sale.created_at))} •{' '}
                {formatCurrency(sale.purchase_amount)}
              </p>
            </div>

            {/* Cashback */}
            <div className="flex items-center gap-sm">
              <span className="text-success font-semibold">
                +{formatCurrency(sale.cashback_generated)}
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

---

## Passo 5: Criar Formatadores

Criar `src/lib/formatters.ts`:

```typescript
export function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);

  if (match) {
    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '.' + match[2];
    if (match[3]) formatted += '.' + match[3];
    if (match[4]) formatted += '-' + match[4];
    return formatted;
  }

  return value;
}

export function unformatCPF(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(
    /^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/
  );

  if (match) {
    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '.' + match[2];
    if (match[3]) formatted += '.' + match[3];
    if (match[4]) formatted += '/' + match[4];
    if (match[5]) formatted += '-' + match[5];
    return formatted;
  }

  return value;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCurrencyInput(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const number = parseInt(cleaned, 10) / 100;

  if (isNaN(number)) return '';

  return formatCurrency(number);
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/\D/g, '');
  return parseInt(cleaned, 10) / 100 || 0;
}

export function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length <= 10) {
    const match = cleaned.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/);
    if (match) {
      let formatted = '';
      if (match[1]) formatted += '(' + match[1];
      if (match[2]) formatted += ') ' + match[2];
      if (match[3]) formatted += '-' + match[3];
      return formatted;
    }
  } else {
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      let formatted = '';
      if (match[1]) formatted += '(' + match[1];
      if (match[2]) formatted += ') ' + match[2];
      if (match[3]) formatted += '-' + match[3];
      return formatted;
    }
  }

  return value;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'} atrás`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} atrás`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;

  return formatDate(d);
}

export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
```

---

## Passo 6: Criar Hook useSales

Criar `src/hooks/useSales.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Sale, DashboardStats } from '@/types/sale';

export function useSales() {
  const { store } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentSales = useCallback(async (limit = 5) => {
    if (!store?.id) return;

    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('store_id', store.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setRecentSales(data || []);
    } catch (error) {
      console.error('Erro ao buscar vendas recentes:', error);
    }
  }, [store?.id]);

  const fetchDashboardStats = useCallback(async () => {
    if (!store?.id) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Vendas de hoje
      const { data: todaySales, error: todayError } = await supabase
        .from('sales')
        .select('purchase_amount, cashback_generated, customer_id')
        .eq('store_id', store.id)
        .eq('status', 'confirmed')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (todayError) throw todayError;

      // Vendas de ontem
      const { data: yesterdaySales, error: yesterdayError } = await supabase
        .from('sales')
        .select('purchase_amount, cashback_generated')
        .eq('store_id', store.id)
        .eq('status', 'confirmed')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      if (yesterdayError) throw yesterdayError;

      // Calcular estatísticas
      const salesToday = todaySales?.length || 0;
      const salesYesterday = yesterdaySales?.length || 0;

      const revenueToday = todaySales?.reduce(
        (acc, sale) => acc + (sale.purchase_amount || 0),
        0
      ) || 0;
      const revenueYesterday = yesterdaySales?.reduce(
        (acc, sale) => acc + (sale.purchase_amount || 0),
        0
      ) || 0;

      const cashbackToday = todaySales?.reduce(
        (acc, sale) => acc + (sale.cashback_generated || 0),
        0
      ) || 0;

      // Clientes únicos hoje
      const uniqueCustomers = new Set(
        todaySales?.map((sale) => sale.customer_id) || []
      );
      const customersToday = uniqueCustomers.size;

      setStats({
        salesToday,
        salesYesterday,
        revenueToday,
        revenueYesterday,
        cashbackToday,
        customersToday,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, [store?.id]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchRecentSales(), fetchDashboardStats()]);
    setIsLoading(false);
  }, [fetchRecentSales, fetchDashboardStats]);

  useEffect(() => {
    if (store?.id) {
      loadDashboard();
    }
  }, [store?.id, loadDashboard]);

  return {
    sales,
    recentSales,
    stats,
    isLoading,
    fetchRecentSales,
    fetchDashboardStats,
    loadDashboard,
  };
}
```

---

## Passo 7: Implementar Página Dashboard

Atualizar `src/app/(dashboard)/page.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { ShoppingBag, DollarSign, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSales } from '@/hooks/useSales';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentSales } from '@/components/dashboard/RecentSales';
import { Skeleton } from '@/components/ui';
import { formatCurrency, getGreeting } from '@/lib/formatters';

export default function DashboardPage() {
  const { store } = useAuth();
  const { recentSales, stats, isLoading } = useSales();

  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return { value: 0, isPositive: true };
    const change = ((today - yesterday) / yesterday) * 100;
    return {
      value: Math.round(change),
      isPositive: change >= 0,
    };
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-header">
          {getGreeting()}, {store?.name?.split(' ')[0] || 'Loja'}!
        </h1>
        <p className="text-body-lg text-text-secondary">
          Aqui está o resumo do seu dia
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-lg">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Vendas Hoje"
              value={stats?.salesToday.toString() || '0'}
              trend={calculateTrend(
                stats?.salesToday || 0,
                stats?.salesYesterday || 0
              )}
              subtitle="vs ontem"
              icon={<ShoppingBag className="w-5 h-5 text-text-secondary" />}
            />
            <StatCard
              title="Receita Hoje"
              value={formatCurrency(stats?.revenueToday || 0)}
              trend={calculateTrend(
                stats?.revenueToday || 0,
                stats?.revenueYesterday || 0
              )}
              subtitle="vs ontem"
              icon={<DollarSign className="w-5 h-5 text-text-secondary" />}
            />
            <StatCard
              title="Cashback Distribuído"
              value={formatCurrency(stats?.cashbackToday || 0)}
              subtitle={`${stats?.customersToday || 0} clientes hoje`}
              icon={<Gift className="w-5 h-5 text-text-secondary" />}
            />
          </>
        )}
      </div>

      {/* Quick Action */}
      <div className="mb-lg">
        <QuickActions />
      </div>

      {/* Recent Sales */}
      <section>
        <div className="flex items-center justify-between mb-md">
          <h2 className="section-title">Últimas vendas</h2>
          <Link
            href="/vendas"
            className="text-body text-primary font-medium hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        <RecentSales sales={recentSales} isLoading={isLoading} />
      </section>
    </div>
  );
}
```

---

## Passo 8: Exportar Componentes do Dashboard

Criar `src/components/dashboard/index.ts`:

```typescript
export { StatCard } from './StatCard';
export { QuickActions } from './QuickActions';
export { RecentSales } from './RecentSales';
```

---

## Checklist

- [ ] Tipos de venda criados
- [ ] StatCard implementado
- [ ] QuickActions implementado
- [ ] RecentSales implementado
- [ ] Formatadores criados
- [ ] Hook useSales criado
- [ ] Página Dashboard implementada
- [ ] Componentes exportados

---

## Tabela no Supabase

```sql
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) NOT NULL,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_cpf VARCHAR(14) NOT NULL,
  purchase_amount DECIMAL(10,2) NOT NULL,
  balance_used DECIMAL(10,2) DEFAULT 0,
  amount_paid DECIMAL(10,2) NOT NULL,
  cashback_generated DECIMAL(10,2) NOT NULL,
  cashback_percentage DECIMAL(5,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sales_store_id ON sales(store_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can view own sales" ON sales
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

CREATE POLICY "Stores can insert own sales" ON sales
  FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );
```

---

## Próximo Passo

Seguir para [07-registrar-venda.md](./07-registrar-venda.md) para implementar o fluxo de registro de venda.
