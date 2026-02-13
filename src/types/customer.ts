// Cliente (profile do sistema)
export interface Customer {
  id: string;
  full_name: string;
  cpf: string;
  phone: string | null;
  birth_date: string | null;
  created_at: string | null;
}

// Saldo do cliente na empresa
export interface CustomerBalance {
  customer_id: string;
  company_id: string;
  balance: number;
  last_purchase_date: string | null;
  // Campos calculados (não existem no banco, calculados via agregação)
  total_purchases?: number;
  total_spent?: number;
  total_cashback?: number;
}

// Cliente com saldo na empresa atual
export interface CustomerWithBalance extends Customer {
  storeBalance: CustomerBalance;
}

// Filtros para buscar clientes
export interface CustomersFilters {
  search?: string;
  sortBy?: 'recent' | 'oldest' | 'most_purchases' | 'highest_balance' | 'name_asc' | 'name_desc';
}

// Alias para manter compatibilidade
export type { Customer as CustomerBase };
