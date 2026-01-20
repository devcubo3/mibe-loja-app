export interface Customer {
  id: string;
  name: string;
  cpf: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface CustomerBalance {
  customer_id: string;
  store_id: string;
  balance: number;
  total_purchases: number;
  total_spent: number;
  total_cashback: number;
  last_purchase?: string;
}

export interface CustomerWithBalance extends Customer {
  storeBalance: CustomerBalance;
}
