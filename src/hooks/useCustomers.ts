'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { CustomerWithBalance, CustomersFilters } from '@/types/customer';

type SortOption = CustomersFilters['sortBy'];

export function useCustomers() {
  const { company } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(
    async (options?: CustomersFilters & { page?: number; append?: boolean }) => {
      if (!company?.id) {
        setIsLoading(false);
        return;
      }

      const { search = '', sortBy = 'recent', page = 0, append = false } = options || {};
      const pageSize = 20;

      if (page === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        // Buscar saldos de cashback da empresa com dados do cliente
        let query = supabase
          .from('cashback_balances')
          .select(`
            id,
            user_id,
            company_id,
            current_balance,
            last_purchase_date,
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

        // Ordenação
        switch (sortBy) {
          case 'recent':
            query = query.order('last_purchase_date', { ascending: false, nullsFirst: false });
            break;
          case 'oldest':
            query = query.order('last_purchase_date', { ascending: true, nullsFirst: true });
            break;
          case 'highest_balance':
            query = query.order('current_balance', { ascending: false });
            break;
          default:
            query = query.order('last_purchase_date', { ascending: false, nullsFirst: false });
        }

        // Paginação
        query = query.range(page * pageSize, (page + 1) * pageSize - 1);

        const { data, error: queryError, count } = await query;

        if (queryError) throw queryError;

        // Buscar estatísticas de transações para cada cliente
        const customerIds = data?.map((b: any) => b.user_id).filter(Boolean) || [];

        let transactionStats: Record<string, { total_purchases: number; total_spent: number; total_cashback: number }> = {};

        if (customerIds.length > 0) {
          const { data: transactions } = await supabase
            .from('transactions')
            .select('user_id, total_amount, cashback_earned')
            .eq('company_id', company.id)
            .in('user_id', customerIds);

          // Agregar estatísticas por cliente
          transactions?.forEach((t) => {
            if (!t.user_id) return;
            if (!transactionStats[t.user_id]) {
              transactionStats[t.user_id] = { total_purchases: 0, total_spent: 0, total_cashback: 0 };
            }
            transactionStats[t.user_id].total_purchases += 1;
            transactionStats[t.user_id].total_spent += t.total_amount || 0;
            transactionStats[t.user_id].total_cashback += t.cashback_earned || 0;
          });
        }

        // Formatar clientes
        let formattedCustomers: CustomerWithBalance[] = (data || [])
          .filter((b: any) => b.profiles)
          .map((b: any) => ({
            id: b.profiles.id,
            full_name: b.profiles.full_name,
            cpf: b.profiles.cpf,
            phone: b.profiles.phone,
            birth_date: b.profiles.birth_date,
            created_at: b.profiles.created_at,
            storeBalance: {
              customer_id: b.user_id,
              company_id: b.company_id,
              balance: b.current_balance || 0,
              last_purchase_date: b.last_purchase_date,
              total_purchases: transactionStats[b.user_id]?.total_purchases || 0,
              total_spent: transactionStats[b.user_id]?.total_spent || 0,
              total_cashback: transactionStats[b.user_id]?.total_cashback || 0,
            },
          }));

        // Filtro de busca (client-side)
        if (search) {
          const searchLower = search.toLowerCase().replace(/[.-]/g, '');
          formattedCustomers = formattedCustomers.filter(
            customer =>
              customer.full_name.toLowerCase().includes(searchLower) ||
              customer.cpf.replace(/[.-]/g, '').includes(searchLower) ||
              customer.phone?.replace(/[()-\s]/g, '').includes(searchLower)
          );
        }

        // Ordenação adicional por compras/nome (client-side)
        if (sortBy === 'most_purchases') {
          formattedCustomers.sort((a, b) =>
            (b.storeBalance.total_purchases || 0) - (a.storeBalance.total_purchases || 0)
          );
        } else if (sortBy === 'name_asc') {
          formattedCustomers.sort((a, b) => a.full_name.localeCompare(b.full_name));
        } else if (sortBy === 'name_desc') {
          formattedCustomers.sort((a, b) => b.full_name.localeCompare(a.full_name));
        }

        setTotalCount(count || formattedCustomers.length);

        if (append) {
          setCustomers(prev => [...prev, ...formattedCustomers]);
        } else {
          setCustomers(formattedCustomers);
        }
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        setError('Erro ao buscar clientes');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [company?.id]
  );

  const getCustomerById = useCallback(async (id: string): Promise<CustomerWithBalance | null> => {
    if (!company?.id) return null;

    try {
      // Buscar saldo do cliente
      const { data: balance, error: balanceError } = await supabase
        .from('cashback_balances')
        .select(`
          id,
          user_id,
          company_id,
          current_balance,
          last_purchase_date,
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
        .eq('user_id', id)
        .single();

      if (balanceError || !balance || !(balance as any).profiles) {
        // Cliente pode não ter saldo ainda, buscar só o profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, cpf, phone, birth_date, created_at')
          .eq('id', id)
          .single();

        if (profileError || !profile) return null;

        return {
          id: profile.id,
          full_name: profile.full_name,
          cpf: profile.cpf,
          phone: profile.phone,
          birth_date: profile.birth_date,
          created_at: profile.created_at,
          storeBalance: {
            customer_id: profile.id,
            company_id: company.id,
            balance: 0,
            last_purchase_date: null,
            total_purchases: 0,
            total_spent: 0,
            total_cashback: 0,
          },
        };
      }

      // Buscar estatísticas de transações
      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_amount, cashback_earned')
        .eq('company_id', company.id)
        .eq('user_id', id);

      const stats = transactions?.reduce(
        (acc, t) => ({
          total_purchases: acc.total_purchases + 1,
          total_spent: acc.total_spent + (t.total_amount || 0),
          total_cashback: acc.total_cashback + (t.cashback_earned || 0),
        }),
        { total_purchases: 0, total_spent: 0, total_cashback: 0 }
      ) || { total_purchases: 0, total_spent: 0, total_cashback: 0 };

      const profile = (balance as any).profiles;

      return {
        id: profile.id,
        full_name: profile.full_name,
        cpf: profile.cpf,
        phone: profile.phone,
        birth_date: profile.birth_date,
        created_at: profile.created_at,
        storeBalance: {
          customer_id: balance.user_id!,
          company_id: balance.company_id!,
          balance: balance.current_balance || 0,
          last_purchase_date: balance.last_purchase_date,
          ...stats,
        },
      };
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
      return null;
    }
  }, [company?.id]);

  const findCustomerByCpf = useCallback(async (cpf: string): Promise<CustomerWithBalance | null> => {
    if (!company?.id) return null;

    try {
      // Limpar CPF (remover pontos e traços)
      const cleanCpf = cpf.replace(/[.-]/g, '');

      // Buscar profile pelo CPF
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, cpf, phone, birth_date, created_at')
        .eq('cpf', cleanCpf)
        .single();

      if (profileError || !profile) return null;

      // Buscar saldo do cliente nesta empresa
      const { data: balance } = await supabase
        .from('cashback_balances')
        .select('current_balance, last_purchase_date')
        .eq('company_id', company.id)
        .eq('user_id', profile.id)
        .single();

      // Buscar estatísticas de transações
      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_amount, cashback_earned')
        .eq('company_id', company.id)
        .eq('user_id', profile.id);

      const stats = transactions?.reduce(
        (acc, t) => ({
          total_purchases: acc.total_purchases + 1,
          total_spent: acc.total_spent + (t.total_amount || 0),
          total_cashback: acc.total_cashback + (t.cashback_earned || 0),
        }),
        { total_purchases: 0, total_spent: 0, total_cashback: 0 }
      ) || { total_purchases: 0, total_spent: 0, total_cashback: 0 };

      return {
        id: profile.id,
        full_name: profile.full_name,
        cpf: profile.cpf,
        phone: profile.phone,
        birth_date: profile.birth_date,
        created_at: profile.created_at,
        storeBalance: {
          customer_id: profile.id,
          company_id: company.id,
          balance: balance?.current_balance || 0,
          last_purchase_date: balance?.last_purchase_date || null,
          ...stats,
        },
      };
    } catch (err) {
      console.error('Erro ao buscar cliente por CPF:', err);
      return null;
    }
  }, [company?.id]);

  useEffect(() => {
    if (company?.id) {
      fetchCustomers();
    }
  }, [company?.id, fetchCustomers]);

  return {
    customers,
    isLoading,
    isLoadingMore,
    totalCount,
    error,
    fetchCustomers,
    getCustomerById,
    findCustomerByCpf,
  };
}
