'use client';

import { ShoppingBag, DollarSign, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSales } from '@/hooks/useSales';
import { getGreeting, formatCurrency } from '@/lib/formatters';
import { StatCard, QuickActions, RecentSales } from '@/components/dashboard';

export default function HomePage() {
  const { company } = useAuth();
  const { stats, isLoading, calculateTrend } = useSales();

  const greeting = getGreeting();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-header">
          {greeting}
          {company?.business_name && `, ${company.business_name}`}!
        </h1>
        <p className="text-body text-text-secondary">
          Aqui está o resumo do seu dia
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-lg">
        <StatCard
          title="Vendas Hoje"
          value={isLoading ? '...' : stats?.salesToday.toString() || '0'}
          icon={ShoppingBag}
          variant="purple"
          trend={
            stats
              ? {
                value: calculateTrend(
                  stats.salesTodayCount,
                  stats.salesYesterdayCount
                ),
                isPositive:
                  stats.salesTodayCount >= stats.salesYesterdayCount,
              }
              : undefined
          }
        />
        <StatCard
          title="Receita Hoje"
          value={
            isLoading
              ? '...'
              : formatCurrency(stats?.revenueToday || 0)
          }
          icon={DollarSign}
          variant="success"
          trend={
            stats
              ? {
                value: calculateTrend(
                  stats.revenueToday,
                  stats.revenueYesterday
                ),
                isPositive: stats.revenueToday >= stats.revenueYesterday,
              }
              : undefined
          }
        />
        <StatCard
          title="Cashback Distribuído"
          value={
            isLoading
              ? '...'
              : formatCurrency(stats?.cashbackToday || 0)
          }
          icon={Wallet}
          variant="warning"
          trend={
            stats
              ? {
                value: calculateTrend(
                  stats.cashbackToday,
                  stats.cashbackYesterday
                ),
                isPositive: stats.cashbackToday >= stats.cashbackYesterday,
              }
              : undefined
          }
          subtitle={
            company?.cashback_percent
              ? `${company.cashback_percent}% de cashback`
              : undefined
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-lg">
        <QuickActions />
      </div>

      {/* Recent Sales */}
      <RecentSales sales={stats?.recentSales || []} isLoading={isLoading} />
    </div>
  );
}
