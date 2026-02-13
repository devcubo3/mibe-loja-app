export interface Store {
  id: string;
  user_id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  logo_url?: string;
  cover_image?: string;
  category: string;
  description?: string;
  photos?: string[];
  cashback_percentage: number;
  has_expiration: boolean;
  expiration_days?: number;
  has_min_purchase: boolean;
  min_purchase?: number;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface StoreUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  logo_url?: string;
  cover_image?: string;
  category?: string;
  description?: string;
  photos?: string[];
  cashback_percentage?: number;
  has_expiration?: boolean;
  expiration_days?: number;
  has_min_purchase?: boolean;
  min_purchase?: number;
  category_id?: number;
}

export interface Review {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  reply?: {
    text: string;
    created_at: string;
  };
}

export const STORE_CATEGORIES = [
  'Alimentação',
  'Compras',
  'Saúde',
  'Casa',
  'Beleza',
  'Fitness',
  'Pet',
  'Educação',
  'Lazer',
  'Viagem',
  'Serviços',
  'Tecnologia',
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];
