'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardStats, SaleWithCustomer, Customer, CreateSaleData, SalesFilters } from '@/types/sale';
import { useAuth } from './useAuth';

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
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
      const yesterdayEnd = todayStart;

      // Buscar vendas de hoje
      const { data: todaySales, error: todayError } = await supabase
        .from('transactions')
        .select('total_amount, net_amount_paid, cashback_earned')
        .eq('company_id', company.id)
        .gte('created_at', todayStart);

      if (todayError) throw todayError;

      // Buscar vendas de ontem
      const { data: yesterdaySales, error: yesterdayError } = await supabase
        .from('transactions')
        .select('total_amount, net_amount_paid, cashback_earned')
        .eq('company_id', company.id)
        .gte('created_at', yesterdayStart)
        .lt('created_at', yesterdayEnd);

      if (yesterdayError) throw yesterdayError;

      // Buscar vendas recentes com dados do cliente
      const { data: recentTransactions, error: recentError } = await supabase
        .from('transactions')
        .select(`
          id,
          company_id,
          user_id,
          total_amount,
          cashback_redeemed,
          net_amount_paid,
          cashback_earned,
          admin_fee_amount,
          created_at,
          profiles:user_id (
            id,
            full_name,
            cpf,
            phone,
            birth_date,
            created_at
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Calcular estatísticas
      const salesToday = todaySales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
      const salesYesterday = yesterdaySales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
      const revenueToday = todaySales?.reduce((sum, s) => sum + (s.net_amount_paid || 0), 0) || 0;
      const revenueYesterday = yesterdaySales?.reduce((sum, s) => sum + (s.net_amount_paid || 0), 0) || 0;
      const cashbackToday = todaySales?.reduce((sum, s) => sum + (s.cashback_earned || 0), 0) || 0;
      const cashbackYesterday = yesterdaySales?.reduce((sum, s) => sum + (s.cashback_earned || 0), 0) || 0;

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
        created_at: t.created_at,
        customer: t.profiles ? {
          id: t.profiles.id,
          full_name: t.profiles.full_name,
          cpf: t.profiles.cpf,
          phone: t.profiles.phone,
          birth_date: t.profiles.birth_date,
          created_at: t.profiles.created_at,
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
      const pageSize = 20;
      const now = new Date();

      // Construir query base
      let query = supabase
        .from('transactions')
        .select(`
          id,
          company_id,
          user_id,
          total_amount,
          cashback_redeemed,
          net_amount_paid,
          cashback_earned,
          admin_fee_amount,
          created_at,
          profiles:user_id (
            id,
            full_name,
            cpf,
            phone,
            birth_date,
            created_at
          )
        `, { count: 'exact' })
        .eq('company_id', company.id);

      // Filtro de período
      if (period === 'day') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', todayStart);
      } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', weekAgo);
      } else if (period === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', monthAgo);
      }

      // Filtro de tipo
      if (type === 'with_cashback') {
        query = query.gt('cashback_redeemed', 0);
      } else if (type === 'without_cashback') {
        query = query.eq('cashback_redeemed', 0);
      }

      // Ordenação
      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('total_amount', { ascending: false });
          break;
        case 'lowest':
          query = query.order('total_amount', { ascending: true });
          break;
      }

      // Paginação
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

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
        created_at: t.created_at,
        customer: t.profiles ? {
          id: t.profiles.id,
          full_name: t.profiles.full_name,
          cpf: t.profiles.cpf,
          phone: t.profiles.phone,
          birth_date: t.profiles.birth_date,
          created_at: t.profiles.created_at,
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
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          company_id,
          user_id,
          total_amount,
          cashback_redeemed,
          net_amount_paid,
          cashback_earned,
          admin_fee_amount,
          created_at,
          profiles:user_id (
            id,
            full_name,
            cpf,
            phone,
            birth_date,
            created_at
          )
        `)
        .eq('id', id)
        .eq('company_id', company.id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        company_id: data.company_id,
        user_id: data.user_id,
        total_amount: data.total_amount,
        cashback_redeemed: (data as any).cashback_redeemed || 0,
        net_amount_paid: data.net_amount_paid,
        cashback_earned: data.cashback_earned,
        admin_fee_amount: data.admin_fee_amount,
        created_at: data.created_at,
        customer: (data as any).profiles ? {
          id: (data as any).profiles.id,
          full_name: (data as any).profiles.full_name,
          cpf: (data as any).profiles.cpf,
          phone: (data as any).profiles.phone,
          birth_date: (data as any).profiles.birth_date,
          created_at: (data as any).profiles.created_at,
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
      const { data: newSale, error } = await supabase
        .from('transactions')
        .insert({
          company_id: company.id,
          user_id: data.user_id,
          total_amount: data.total_amount,
          cashback_redeemed: data.cashback_redeemed,
          net_amount_paid: data.net_amount_paid,
          cashback_earned: data.cashback_earned,
        })
        .select(`
          id,
          company_id,
          user_id,
          total_amount,
          cashback_redeemed,
          net_amount_paid,
          cashback_earned,
          admin_fee_amount,
          created_at,
          profiles:user_id (
            id,
            full_name,
            cpf,
            phone,
            birth_date,
            created_at
          )
        `)
        .single();

      if (error) throw error;

      const sale: SaleWithCustomer = {
        id: newSale.id,
        company_id: newSale.company_id,
        user_id: newSale.user_id,
        total_amount: newSale.total_amount,
        cashback_redeemed: (newSale as any).cashback_redeemed || 0,
        net_amount_paid: newSale.net_amount_paid,
        cashback_earned: newSale.cashback_earned,
        admin_fee_amount: newSale.admin_fee_amount,
        created_at: newSale.created_at,
        customer: (newSale as any).profiles ? {
          id: (newSale as any).profiles.id,
          full_name: (newSale as any).profiles.full_name,
          cpf: (newSale as any).profiles.cpf,
          phone: (newSale as any).profiles.phone,
          birth_date: (newSale as any).profiles.birth_date,
          created_at: (newSale as any).profiles.created_at,
        } : null,
      };

      // Recarregar estatísticas
      loadStats();

      return { success: true, sale };
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
