# 05 - Autenticação

## Objetivo
Implementar sistema de autenticação com Supabase, tela de login e proteção de rotas.

---

## Passo 1: Criar Tipos de Autenticação

Criar `src/types/auth.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Store {
  id: string;
  user_id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  cashback_percentage: number;
  expiration_days: number;
  min_purchase: number;
  created_at: string;
  updated_at: string;
}

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
```

---

## Passo 2: Criar Store de Autenticação (Zustand)

Criar `src/hooks/useAuth.ts`:

```typescript
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, Store, AuthState, LoginCredentials, AuthError } from '@/types/auth';

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
      isLoading: true,
      isAuthenticated: false,

      setLoading: (loading) => set({ isLoading: loading }),

      login: async (credentials) => {
        set({ isLoading: true });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            set({ isLoading: false });
            return {
              success: false,
              error: {
                message: getErrorMessage(error.message),
                code: error.message,
              },
            };
          }

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              created_at: data.user.created_at,
            };

            set({ user, isAuthenticated: true });

            // Carregar dados da loja
            await get().loadStore();
          }

          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: {
              message: 'Erro ao fazer login. Tente novamente.',
            },
          };
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        }

        set({
          user: null,
          store: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      loadUser: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at,
            };

            set({ user, isAuthenticated: true });
            await get().loadStore();
          } else {
            set({ user: null, store: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          set({ user: null, store: null, isAuthenticated: false });
        }

        set({ isLoading: false });
      },

      loadStore: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Erro ao carregar loja:', error);
            return;
          }

          if (data) {
            const store: Store = {
              id: data.id,
              user_id: data.user_id,
              name: data.name,
              cnpj: data.cnpj,
              email: data.email,
              phone: data.phone,
              address: data.address,
              logo_url: data.logo_url,
              cashback_percentage: data.cashback_percentage,
              expiration_days: data.expiration_days,
              min_purchase: data.min_purchase,
              created_at: data.created_at,
              updated_at: data.updated_at,
            };

            set({ store });
          }
        } catch (error) {
          console.error('Erro ao carregar loja:', error);
        }
      },
    }),
    {
      name: 'mibe-auth',
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper para mensagens de erro
function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos',
    'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada.',
    'User not found': 'Usuário não encontrado',
    'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
  };

  return messages[code] || 'Erro ao fazer login. Tente novamente.';
}
```

---

## Passo 3: Criar Provider de Autenticação

Criar `src/components/providers/AuthProvider.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, setLoading } = useAuth();

  useEffect(() => {
    // Carregar usuário ao iniciar
    loadUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          await loadUser();
        } else if (event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser, setLoading]);

  return <>{children}</>;
}
```

---

## Passo 4: Criar Layout de Autenticação

Criar `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {children}
    </div>
  );
}
```

---

## Passo 5: Criar Página de Login

Criar `src/app/(auth)/login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    const result = await login(data);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error?.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-lg">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-xl">
          <Logo width={140} className="mx-auto mb-lg" />
          <h1 className="text-header font-bold mb-sm">Área da Empresa</h1>
          <p className="text-body-lg text-text-secondary">
            Entre com sua conta para acessar o painel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
          {/* Error Alert */}
          {error && (
            <div className="bg-error-light border border-error rounded-sm p-md">
              <p className="text-body text-error">{error}</p>
            </div>
          )}

          {/* Email */}
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            showPasswordToggle
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/esqueci-senha"
              className="text-body text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Entrar
          </Button>
        </form>

        {/* Version */}
        <p className="text-center text-caption text-text-muted mt-xl">
          Versão 1.0.0
        </p>
      </div>
    </div>
  );
}
```

---

## Passo 6: Criar Middleware de Proteção de Rotas

Criar `src/middleware.ts`:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isProtectedRoute = !isAuthPage && !req.nextUrl.pathname.startsWith('/_next');

  // Se não está autenticado e tenta acessar rota protegida
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Se está autenticado e tenta acessar página de login
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json).*)',
  ],
};
```

---

## Passo 7: Atualizar Root Layout

Atualizar `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'MIBE Store',
  description: 'Painel da empresa MIBE',
  manifest: '/manifest.json',
  themeColor: '#181818',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

## Passo 8: Atualizar Dashboard Layout

Atualizar `src/app/(dashboard)/layout.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { store, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: Buscar contagem de notificações
  const notificationCount = 3;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-md w-full max-w-md p-lg">
          <Skeleton className="h-12 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  // Não renderizar se não autenticado
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        storeName={store?.name || 'Minha Loja'}
        notificationCount={notificationCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:ml-sidebar">
        {/* Header (Mobile) */}
        <Header
          notificationCount={notificationCount}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="pb-24 lg:pb-0">{children}</main>

        {/* Bottom Navigation (Mobile) */}
        <MobileNav onMoreClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}
```

---

## Passo 9: Atualizar Sidebar com Logout

Atualizar a Sidebar para receber a prop `onLogout`:

```tsx
// Em src/components/layout/Sidebar.tsx, adicionar a prop:

interface SidebarProps {
  storeName?: string;
  notificationCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;  // Adicionar
}

// E usar no botão de logout:
<button
  onClick={() => {
    onLogout?.();
    onClose?.();
  }}
  className="sidebar-item w-full text-error/70 hover:text-error hover:bg-error/10"
>
  <LogOut className="w-5 h-5" />
  <span>Sair</span>
</button>
```

---

## Passo 10: Criar Página de Esqueci Senha (Opcional)

Criar `src/app/(auth)/esqueci-senha/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        setError('Erro ao enviar e-mail. Tente novamente.');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError('Erro ao enviar e-mail. Tente novamente.');
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-lg">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-lg">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-title font-bold mb-sm">E-mail enviado!</h1>
          <p className="text-body text-text-secondary mb-xl">
            Verifique sua caixa de entrada e siga as instruções para redefinir
            sua senha.
          </p>
          <Link href="/login">
            <Button fullWidth variant="secondary">
              Voltar para o login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-lg">
      <div className="w-full max-w-sm">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-body text-text-secondary hover:text-text-primary mb-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Header */}
        <div className="mb-xl">
          <Logo width={100} className="mb-lg" />
          <h1 className="text-title font-bold mb-sm">Esqueceu sua senha?</h1>
          <p className="text-body text-text-secondary">
            Digite seu e-mail e enviaremos instruções para redefinir sua senha.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
          {error && (
            <div className="bg-error-light border border-error rounded-sm p-md">
              <p className="text-body text-error">{error}</p>
            </div>
          )}

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            Enviar instruções
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

## Checklist

- [ ] Tipos de autenticação criados
- [ ] Store Zustand de autenticação criado
- [ ] AuthProvider implementado
- [ ] Layout de autenticação criado
- [ ] Página de login implementada
- [ ] Middleware de proteção de rotas criado
- [ ] Root Layout atualizado com AuthProvider
- [ ] Dashboard Layout atualizado com verificação de auth
- [ ] Sidebar atualizada com logout
- [ ] Página de esqueci senha criada (opcional)

---

## Tabela no Supabase

Certifique-se de que existe a tabela `stores` no Supabase com a estrutura:

```sql
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  logo_url TEXT,
  cashback_percentage DECIMAL(5,2) DEFAULT 5.00,
  expiration_days INTEGER DEFAULT 90,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own store" ON stores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own store" ON stores
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## Próximo Passo

Seguir para [06-dashboard.md](./06-dashboard.md) para implementar a página inicial completa.
