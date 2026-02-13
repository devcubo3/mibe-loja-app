// Usuário do estabelecimento (company_users)
export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  company_id: string;
  created_at: string | null;
  updated_at: string | null;
}

// Dados da empresa para o contexto de auth
export interface CompanyData {
  id: string;
  business_name: string;
  cnpj: string | null;
  email: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  status: 'active' | 'inactive' | 'pending' | null;
  cashback_percent: number;
  min_purchase_value: number;
  has_expiration: boolean;
  expiration_days: number;
  category: string;
  photos: string[];
  rating: number;
  total_reviews: number;
  created_at: string | null;
}

export interface AuthState {
  user: CompanyUser | null;
  company: CompanyData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: CompanyUser;
  company: CompanyData;
}

export interface AuthError {
  message: string;
  code?: string;
}

// Re-exportar Store como alias de CompanyData para compatibilidade
export type Store = CompanyData;
export type User = CompanyUser;
