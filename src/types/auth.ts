import type { Store } from './store';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birth_date?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// Re-exporta Store de types/store.ts para evitar duplicação
export type { Store } from './store';

export interface AuthState {
  user: User | null;
  store: Store | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
}
