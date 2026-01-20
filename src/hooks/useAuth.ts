'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Store, AuthState, LoginCredentials, AuthError } from '@/types/auth';

// Dados mockados para desenvolvimento
const MOCK_USER: User = {
  id: 'mock-user-123',
  name: 'João Silva Santos',
  email: 'joao.silva@email.com',
  cpf: '12345678900',
  phone: '11987654321',
  birth_date: '1990-03-15',
  photo_url: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_STORE: Store = {
  id: 'mock-store-123',
  user_id: 'mock-user-123',
  name: 'Restaurante Sabor & Arte',
  cnpj: '12345678000199',
  email: 'contato@saborarte.com',
  phone: '1134567890',
  whatsapp: '11987654321',
  address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
  logo_url: undefined,
  cover_image: undefined,
  category: 'Alimentação',
  description: 'Restaurante especializado em culinária brasileira contemporânea. Ambiente aconchegante e atendimento de primeira qualidade.',
  photos: [],
  cashback_percentage: 5,
  has_expiration: true,
  expiration_days: 90,
  has_min_purchase: true,
  min_purchase: 20,
  rating: 4.8,
  total_reviews: 127,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadStore: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      store: null,
      isLoading: false,
      isAuthenticated: false,

      setLoading: (loading) => set({ isLoading: loading }),

      login: async (credentials) => {
        set({ isLoading: true });

        await new Promise(resolve => setTimeout(resolve, 500));

        set({
          user: MOCK_USER,
          store: MOCK_STORE,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      },

      logout: async () => {
        set({
          user: null,
          store: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      loadUser: async () => {
        const currentState = get();
        if (!currentState.isAuthenticated) {
          set({ isLoading: false });
        }
      },

      loadStore: async () => {
        const currentState = get();
        if (currentState.isAuthenticated && !currentState.store) {
          set({ store: MOCK_STORE });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
