'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // Used in other places possibly, leaving for now, actual cleanup can happen later if needed.
import { DashboardStats, SaleWithCustomer, Customer, CreateSaleData, SalesFilters } from '@/types/sale';
import { useAuth } from './useAuth';
import { storeService } from '@/services/storeService';

export function useSales() {
  const { company } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sales, setSales] = useState<SaleWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!company?.id) {
      setIsLoading(false);
      return;
    }

    loadStats();
  }, [company?.id]);

  const loadStats = async () => {
    if (!company?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = storeService.getAuthToken();
      if (!token) throw new Error('Não autenticado');

      const response = await fetch('/api/sales/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }

      const { todaySales, yesterdaySales, recentTransactions } = await response.json();

      // Calcular estatísticas
      const salesToday = todaySales?.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0) || 0;
      const salesYesterday = yesterdaySales?.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0) || 0;
      const revenueToday = todaySales?.reduce((sum: number, s: any) => sum + (s.net_amount_paid || 0), 0) || 0;
      const revenueYesterday = yesterdaySales?.reduce((sum: number, s: any) => sum + (s.net_amount_paid || 0), 0) || 0;
      const cashbackToday = todaySales?.reduce((sum: number, s: any) => sum + (s.cashback_earned || 0), 0) || 0;
      const cashbackYesterday = yesterdaySales?.reduce((sum: number, s: any) => sum + (s.cashback_earned || 0), 0) || 0;

      // Formatar vendas recentes
      const recentSales: SaleWithCustomer[] = (recentTransactions || []).map((t: any) => ({
        id: t.id,
        company_id: t.company_id,
        user_id: t.user_id,
        total_amount: t.total_amount,
        cashback_redeemed: t.cashback_redeemed || 0,
        net_amount_paid: t.net_amount_paid,
        cashback_earned: t.cashback_earned,
        admin_fee_amount: t.admin_fee_amount,
        payment_method: t.payment_method || 'dinheiro',
        created_at: t.created_at,
        customer: t.profiles ? {
          id: t.profiles.id,
          full_name: t.profiles.full_name,
          cpf: t.profiles.cpf,
          phone: t.profiles.phone,
          birth_date: t.profiles.birth_date,
          created_at: t.profiles.created_at,
          avatar_url: t.profiles.avatar_url,
        } : null,
      }));

      setStats({
        salesToday,
        salesTodayCount: todaySales?.length || 0,
        salesYesterday,
        salesYesterdayCount: yesterdaySales?.length || 0,
        revenueToday,
        revenueYesterday,
        cashbackToday,
        cashbackYesterday,
        recentSales,
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSales = useCallback(async (options?: SalesFilters & { page?: number; append?: boolean }) => {
    if (!company?.id) return;

    const { search = '', type = 'all', period = 'month', sortBy = 'recent', page = 0, append = false } = options || {};

    if (page === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const token = storeService.getAuthToken();
      if (!token) throw new Error('Não autenticado');

      const queryParams = new URLSearchParams({
        search,
        type,
        period,
        sortBy,
        page: page.toString()
      });

      const response = await fetch(`/api/sales/list?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar vendas');
      }

      const { data, count } = await response.json();

      // Formatar vendas
      let formattedSales: SaleWithCustomer[] = (data || []).map((t: any) => ({
        id: t.id,
        company_id: t.company_id,
        user_id: t.user_id,
        total_amount: t.total_amount,
        cashback_redeemed: t.cashback_redeemed || 0,
        net_amount_paid: t.net_amount_paid,
        cashback_earned: t.cashback_earned,
        admin_fee_amount: t.admin_fee_amount,
        payment_method: t.payment_method || 'dinheiro',
        created_at: t.created_at,
        customer: t.profiles ? {
          id: t.profiles.id,
          full_name: t.profiles.full_name,
          cpf: t.profiles.cpf,
          phone: t.profiles.phone,
          birth_date: t.profiles.birth_date,
          created_at: t.profiles.created_at,
          avatar_url: t.profiles.avatar_url,
        } : null,
      }));

      // Filtro de busca (client-side pois Supabase não faz join com filtro)
      if (search) {
        const searchLower = search.toLowerCase().replace(/[.-]/g, '');
        formattedSales = formattedSales.filter(sale =>
          sale.customer?.full_name.toLowerCase().includes(searchLower) ||
          sale.customer?.cpf.replace(/[.-]/g, '').includes(searchLower)
        );
      }

      // Calcular totais
      const total = formattedSales.reduce((sum, sale) => sum + sale.total_amount, 0);
      setTotalAmount(total);
      setTotalCount(count || formattedSales.length);

      if (append) {
        setSales(prev => [...prev, ...formattedSales]);
      } else {
        setSales(formattedSales);
      }
    } catch (err) {
      setError('Erro ao buscar vendas');
      console.error('Erro ao buscar vendas:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [company?.id]);

  const getSaleById = useCallback(async (id: string): Promise<SaleWithCustomer | null> => {
    if (!company?.id) return null;

    try {
      const token = storeService.getAuthToken();
      if (!token) return null;

      const response = await fetch(`/api/sales/detail?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return null;

      const { data } = await response.json();

      if (!data) return null;

      return {
        id: data.id,
        company_id: data.company_id,
        user_id: data.user_id,
        total_amount: data.total_amount,
        cashback_redeemed: (data as any).cashback_redeemed || 0,
        net_amount_paid: data.net_amount_paid,
        cashback_earned: data.cashback_earned,
        admin_fee_amount: data.admin_fee_amount,
        payment_method: data.payment_method || 'dinheiro',
        created_at: data.created_at,
        customer: (data as any).profiles ? {
          id: (data as any).profiles.id,
          full_name: (data as any).profiles.full_name,
          cpf: (data as any).profiles.cpf,
          phone: (data as any).profiles.phone,
          birth_date: (data as any).profiles.birth_date,
          created_at: (data as any).profiles.created_at,
          avatar_url: (data as any).profiles.avatar_url,
        } : null,
      };
    } catch (err) {
      console.error('Erro ao buscar venda:', err);
      return null;
    }
  }, [company?.id]);

  const createSale = useCallback(async (data: CreateSaleData): Promise<{ success: boolean; error?: string; sale?: SaleWithCustomer }> => {
    if (!company?.id) {
      return { success: false, error: 'Empresa não encontrada' };
    }

    try {
      const token = storeService.getAuthToken();
      if (!token) {
        return { success: false, error: 'Não autenticado' };
      }

      const response = await fetch('/api/sales/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: data.user_id,
          total_amount: data.total_amount,
          cashback_redeemed: data.cashback_redeemed,
          net_amount_paid: data.net_amount_paid,
          cashback_earned: data.cashback_earned,
          payment_method: data.payment_method,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Erro ao registrar venda' };
      }

      // Recarregar estatísticas
      loadStats();

      return { success: true, sale: result.sale };
    } catch (err: any) {
      console.error('Erro ao criar venda:', err);
      return { success: false, error: err.message || 'Erro ao registrar venda' };
    }
  }, [company?.id]);

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  };

  return {
    stats,
    sales,
    isLoading,
    isLoadingMore,
    error,
    totalCount,
    totalAmount,
    loadStats,
    fetchSales,
    getSaleById,
    fetchSaleById: getSaleById, // alias
    createSale,
    calculateTrend,
  };
}
