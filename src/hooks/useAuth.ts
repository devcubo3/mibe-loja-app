'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CompanyUser, CompanyData, AuthState, LoginCredentials, AuthError, LoginResponse } from '@/types/auth';

interface AuthStore extends AuthState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadCompany: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateCompany: (data: Partial<CompanyData>) => void;
  updateUser: (data: Partial<CompanyUser>) => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      company: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: async (credentials) => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false });
            return {
              success: false,
              error: { message: data.error || 'Erro ao fazer login' },
            };
          }

          const loginData = data as LoginResponse;

          set({
            user: loginData.user,
            company: loginData.company,
            token: loginData.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: { message: 'Erro de conexão. Tente novamente.' },
          };
        }
      },

      logout: async () => {
        set({
          user: null,
          company: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      loadUser: async () => {
        const currentState = get();
        if (!currentState.isAuthenticated || !currentState.token) {
          set({ isLoading: false });
          return;
        }

        // Verificar se o token ainda é válido
        try {
          const tokenData = JSON.parse(atob(currentState.token));
          if (tokenData.exp < Date.now()) {
            // Token expirado
            set({
              user: null,
              company: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } else {
            // Token válido, manter autenticado
            set({ isLoading: false });
          }
        } catch {
          // Token inválido
          set({
            user: null,
            company: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      loadCompany: async () => {
        const currentState = get();
        if (!currentState.isAuthenticated || !currentState.token) return;

        try {
          const response = await fetch('/api/company/me', {
            headers: {
              'Authorization': `Bearer ${currentState.token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            set({ company: data.company });
          }
        } catch (error) {
          console.error('Erro ao carregar empresa:', error);
        }
      },

      updateCompany: (data) => {
        const currentState = get();
        if (currentState.company) {
          set({
            company: { ...currentState.company, ...data },
          });
        }
      },

      updateUser: (data) => {
        const currentState = get();
        if (currentState.user) {
          set({
            user: { ...currentState.user, ...data },
          });
        }
      },
    }),
    {
      name: 'mibe-auth-storage',
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Alias para manter compatibilidade com código existente
export const useStore = () => {
  const { company } = useAuth();
  return company;
};
