export interface Sale {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name?: string;
  customer_cpf?: string;
  purchase_amount?: number;
  balance_used?: number;
  amount_paid?: number;
  cashback_generated?: number;
  amount: number;
  cashback_amount: number;
  cashback_percentage: number;
  status: 'pending' | 'approved' | 'cancelled' | 'confirmed';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  created_at: string;
}

export interface SaleWithCustomer extends Sale {
  customer: Customer;
}

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
