'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CustomerWithBalance } from '@/types/customer';

// Mock customers data
const MOCK_CUSTOMERS: CustomerWithBalance[] = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    birth_date: '1990-05-15',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    created_at: new Date().toISOString(),
    storeBalance: {
      customer_id: '1',
      store_id: 'store-1',
      balance: 125.00,
      total_purchases: 5,
      total_spent: 1250.00,
      total_cashback: 125.00,
      last_purchase: new Date().toISOString(),
    },
  },
  {
    id: '2',
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    birth_date: '1985-08-22',
    email: 'maria.santos@email.com',
    phone: '(11) 97654-3210',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    storeBalance: {
      customer_id: '2',
      store_id: 'store-1',
      balance: 85.05,
      total_purchases: 3,
      total_spent: 850.50,
      total_cashback: 85.05,
      last_purchase: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    cpf: '456.789.123-00',
    birth_date: '1992-12-10',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 96543-2109',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    storeBalance: {
      customer_id: '3',
      store_id: 'store-1',
      balance: 45.00,
      total_purchases: 2,
      total_spent: 450.00,
      total_cashback: 45.00,
      last_purchase: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: '4',
    name: 'Ana Costa',
    cpf: '321.654.987-00',
    birth_date: '1988-03-25',
    email: 'ana.costa@email.com',
    phone: '(11) 95432-1098',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    storeBalance: {
      customer_id: '4',
      store_id: 'store-1',
      balance: 75.50,
      total_purchases: 4,
      total_spent: 755.00,
      total_cashback: 75.50,
      last_purchase: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: '5',
    name: 'Carlos Mendes',
    cpf: '789.123.456-00',
    birth_date: '1995-07-18',
    email: 'carlos.mendes@email.com',
    phone: '(11) 94321-0987',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    storeBalance: {
      customer_id: '5',
      store_id: 'store-1',
      balance: 30.00,
      total_purchases: 1,
      total_spent: 300.00,
      total_cashback: 30.00,
      last_purchase: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
];

type SortOption = 'recent' | 'oldest' | 'most_purchases' | 'highest_balance';

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = useCallback(
    async (options?: { 
      search?: string;
      sortBy?: SortOption;
      page?: number;
      append?: boolean;
    }) => {
      const { search = '', sortBy = 'recent', page = 0, append = false } = options || {};

      if (page === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        let filteredCustomers = [...MOCK_CUSTOMERS];

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredCustomers = filteredCustomers.filter(
            customer =>
              customer.name.toLowerCase().includes(searchLower) ||
              customer.cpf.includes(search) ||
              customer.email?.toLowerCase().includes(searchLower) ||
              customer.phone?.includes(search)
          );
        }

        // Apply sorting
        switch (sortBy) {
          case 'recent':
            filteredCustomers.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            break;
          case 'oldest':
            filteredCustomers.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            break;
          case 'most_purchases':
            filteredCustomers.sort((a, b) => 
              b.storeBalance.total_purchases - a.storeBalance.total_purchases
            );
            break;
          case 'highest_balance':
            filteredCustomers.sort((a, b) => 
              b.storeBalance.balance - a.storeBalance.balance
            );
            break;
        }

        setTotalCount(filteredCustomers.length);
        
        if (append) {
          setCustomers(prev => [...prev, ...filteredCustomers.slice(page * 20, (page + 1) * 20)]);
        } else {
          setCustomers(filteredCustomers.slice(0, 20));
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  const getCustomerById = useCallback(async (id: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return MOCK_CUSTOMERS.find(customer => customer.id === id) || null;
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    isLoading,
    isLoadingMore,
    totalCount,
    fetchCustomers,
    getCustomerById,
  };
}
