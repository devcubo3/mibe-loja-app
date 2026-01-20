import { useState, useEffect, useCallback } from 'react';
import { DashboardStats, SaleWithCustomer, Customer } from '@/types/sale';
import { useAuth } from './useAuth';

// Dados mockados
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'customer-1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'joao@email.com',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'customer-2',
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    phone: '(11) 91234-5678',
    email: 'maria@email.com',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'customer-3',
    name: 'Pedro Oliveira',
    cpf: '456.789.123-00',
    phone: '(11) 99876-5432',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_SALES: SaleWithCustomer[] = [
  {
    id: 'sale-1',
    store_id: 'mock-store-123',
    customer_id: 'customer-1',
    amount: 1250.00,
    cashback_amount: 125.00,
    cashback_percentage: 10,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: MOCK_CUSTOMERS[0],
  },
  {
    id: 'sale-2',
    store_id: 'mock-store-123',
    customer_id: 'customer-2',
    amount: 850.50,
    cashback_amount: 85.05,
    cashback_percentage: 10,
    status: 'confirmed',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    customer: MOCK_CUSTOMERS[1],
  },
  {
    id: 'sale-3',
    store_id: 'mock-store-123',
    customer_id: 'customer-3',
    amount: 450.00,
    cashback_amount: 45.00,
    cashback_percentage: 10,
    status: 'confirmed',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    customer: MOCK_CUSTOMERS[2],
  },
  {
    id: 'sale-4',
    store_id: 'mock-store-123',
    customer_id: 'customer-1',
    amount: 600.00,
    cashback_amount: 60.00,
    cashback_percentage: 10,
    status: 'confirmed',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    customer: MOCK_CUSTOMERS[0],
  },
  {
    id: 'sale-5',
    store_id: 'mock-store-123',
    customer_id: 'customer-2',
    amount: 300.00,
    cashback_amount: 30.00,
    cashback_percentage: 10,
    status: 'confirmed',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    customer: MOCK_CUSTOMERS[1],
  },
];

const MOCK_STATS: DashboardStats = {
  salesToday: 2550.50,
  salesTodayCount: 3,
  salesYesterday: 1800.00,
  salesYesterdayCount: 2,
  revenueToday: 2550.50,
  revenueYesterday: 1800.00,
  cashbackToday: 255.05,
  cashbackYesterday: 180.00,
  recentSales: MOCK_SALES,
};

export function useSales() {
  const { store } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sales, setSales] = useState<SaleWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!store?.id) {
      setIsLoading(false);
      return;
    }

    loadStats();
  }, [store?.id]);

  const loadStats = async () => {
    if (!store?.id) return;

    setIsLoading(true);
    setError(null);

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));

    setStats(MOCK_STATS);
    setIsLoading(false);
  };

  const fetchSales = useCallback(async (options?: {
    search?: string;
    type?: 'all' | 'with_cashback' | 'without_cashback';
    period?: 'day' | 'week' | 'month' | 'all';
    sortBy?: 'recent' | 'oldest' | 'highest' | 'lowest';
    page?: number;
    append?: boolean;
  }) => {
    const { search = '', type = 'all', period = 'month', sortBy = 'recent', page = 0, append = false } = options || {};

    if (page === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredSales = [...MOCK_SALES];

      // Aplicar filtro de busca
      if (search) {
        const searchLower = search.toLowerCase();
        filteredSales = filteredSales.filter(
          sale =>
            sale.customer?.name.toLowerCase().includes(searchLower) ||
            sale.customer?.cpf.includes(search)
        );
      }

      // Filtro de tipo
      if (type === 'with_cashback') {
        filteredSales = filteredSales.filter(sale => sale.cashback_amount > 0);
      } else if (type === 'without_cashback') {
        filteredSales = filteredSales.filter(sale => sale.cashback_amount === 0);
      }

      // Filtro de período
      const now = new Date();
      if (period === 'day') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredSales = filteredSales.filter(sale => new Date(sale.created_at) >= today);
      } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSales = filteredSales.filter(sale => new Date(sale.created_at) >= weekAgo);
      } else if (period === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredSales = filteredSales.filter(sale => new Date(sale.created_at) >= monthAgo);
      }

      // Ordenação
      filteredSales.sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'highest':
            return b.amount - a.amount;
          case 'lowest':
            return a.amount - b.amount;
          default:
            return 0;
        }
      });

      // Calcular totais
      const total = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
      setTotalAmount(total);
      setTotalCount(filteredSales.length);

      // Paginação (20 por página)
      const paginatedSales = filteredSales.slice(0, (page + 1) * 20);

      if (append) {
        setSales(prev => [...prev, ...paginatedSales.slice(page * 20)]);
      } else {
        setSales(paginatedSales);
      }
    } catch (err) {
      setError('Erro ao buscar vendas');
      console.error('Erro ao buscar vendas:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const getSaleById = useCallback(async (id: string) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return MOCK_SALES.find(sale => sale.id === id) || null;
  }, []);

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
    calculateTrend 
  };
}
