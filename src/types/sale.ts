// Tipos baseados na estrutura real do banco de dados (transactions)
export interface Sale {
  id: string;
  company_id: string | null;
  user_id: string | null;
  total_amount: number;
  cashback_redeemed: number;
  net_amount_paid: number;
  cashback_earned: number;
  admin_fee_amount: number | null;
  created_at: string | null;
}

// Cliente (profile do cliente que comprou)
export interface Customer {
  id: string;
  full_name: string;
  cpf: string;
  phone: string | null;
  birth_date: string | null;
  created_at: string | null;
}

// Venda com dados do cliente
export interface SaleWithCustomer extends Sale {
  customer: Customer | null;
}

// Estatísticas do dashboard
export interface DashboardStats {
  salesToday: number;
  salesTodayCount: number;
  salesYesterday: number;
  salesYesterdayCount: number;
  revenueToday: number;
  revenueYesterday: number;
  cashbackToday: number;
  cashbackYesterday: number;
  recentSales: SaleWithCustomer[];
}

// Dados para criar uma nova venda
export interface CreateSaleData {
  user_id: string;
  total_amount: number;
  cashback_redeemed: number;
  net_amount_paid: number;
  cashback_earned: number;
}

// Filtros para buscar vendas
export interface SalesFilters {
  search?: string;
  type?: 'all' | 'with_cashback' | 'without_cashback';
  period?: 'day' | 'week' | 'month' | 'all';
  sortBy?: 'recent' | 'oldest' | 'highest' | 'lowest';
}

// Aliases para compatibilidade com código existente
export type { Customer as CustomerBase };
