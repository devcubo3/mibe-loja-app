# 04 - Layout (Sidebar, Header, Mobile Nav)

## Objetivo
Criar a estrutura de layout responsiva com sidebar para desktop e navegação mobile.

---

## Estrutura do Layout

```
Desktop (> 1024px):
┌──────────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌─────────────────────────────────────────┐  │
│ │         │ │                                         │  │
│ │ Sidebar │ │              Main Content               │  │
│ │  280px  │ │                                         │  │
│ │         │ │                                         │  │
│ │         │ │                                         │  │
│ └─────────┘ └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

Mobile (< 1024px):
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │        Header           │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │      Main Content       │ │
│ │                         │ │
│ │                         │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │      Bottom Nav         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## Passo 1: Criar Sidebar

Criar `src/components/layout/Sidebar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  Receipt,
  Users,
  Building2,
  Bell,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  storeName?: string;
  notificationCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Registrar Venda',
    href: '/registrar-venda',
    icon: PlusCircle,
    highlight: true,
  },
  {
    label: 'Histórico de Vendas',
    href: '/vendas',
    icon: Receipt,
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    label: 'Empresa',
    href: '/empresa',
    icon: Building2,
  },
  {
    label: 'Notificações',
    href: '/notificacoes',
    icon: Bell,
    hasBadge: true,
  },
];

const bottomMenuItems = [
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
];

export function Sidebar({
  storeName = 'Minha Loja',
  notificationCount = 0,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-sidebar bg-primary z-50',
          'flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-lg">
          <div className="flex items-center justify-between">
            <Logo width={120} color="#FFFFFF" />
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/70 text-body mt-sm truncate">{storeName}</p>
        </div>

        {/* Divider */}
        <div className="mx-lg h-px bg-white/10" />

        {/* Navigation */}
        <nav className="flex-1 p-md overflow-y-auto">
          <ul className="space-y-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (item.highlight) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="sidebar-item-highlight"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      active ? 'sidebar-item-active' : 'sidebar-item'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.hasBadge && notificationCount > 0 && (
                      <span className="bg-error text-white text-caption font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Divider */}
        <div className="mx-lg h-px bg-white/10" />

        {/* Bottom Menu */}
        <div className="p-md">
          <ul className="space-y-xs">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      active ? 'sidebar-item-active' : 'sidebar-item'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={() => {
                  // TODO: Implementar logout
                  console.log('Logout');
                }}
                className="sidebar-item w-full text-error/70 hover:text-error hover:bg-error/10"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Version */}
        <div className="px-lg pb-lg">
          <p className="text-white/40 text-caption">Versão 1.0.0</p>
        </div>
      </aside>
    </>
  );
}
```

---

## Passo 2: Criar Header (Mobile)

Criar `src/components/layout/Header.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { Menu, Bell, User } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface HeaderProps {
  notificationCount?: number;
  onMenuClick: () => void;
}

export function Header({ notificationCount = 0, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-input-border lg:hidden">
      <div className="flex items-center justify-between h-16 px-md">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-text-primary hover:bg-input-bg rounded-md transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Logo width={100} />
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-xs">
          <Link
            href="/notificacoes"
            className="relative p-2 text-text-primary hover:bg-input-bg rounded-md transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Link>
          <Link
            href="/empresa"
            className="p-2 text-text-primary hover:bg-input-bg rounded-md transition-colors"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
```

---

## Passo 3: Criar Mobile Navigation (Bottom Nav)

Criar `src/components/layout/MobileNav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Receipt, Users, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onMoreClick: () => void;
}

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Vendas',
    href: '/vendas',
    icon: Receipt,
  },
  {
    label: 'Venda',
    href: '/registrar-venda',
    icon: PlusCircle,
    isMain: true,
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    label: 'Menu',
    href: '#',
    icon: MoreHorizontal,
    isMenu: true,
  },
];

export function MobileNav({ onMoreClick }: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '#') return false;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-input-border z-30 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around h-20 px-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isMenu) {
            return (
              <button
                key={item.label}
                onClick={onMoreClick}
                className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]"
              >
                <Icon className="w-6 h-6 text-text-muted" />
                <span className="text-[10px] font-medium text-text-muted">
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center -mt-6 shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-medium text-primary mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]',
                active && 'text-primary'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  active ? 'text-primary' : 'text-text-muted'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active ? 'text-primary' : 'text-text-muted'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## Passo 4: Criar Dashboard Layout

Criar `src/app/(dashboard)/layout.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: Buscar do contexto de autenticação
  const storeName = 'Restaurante Sabor & Arte';
  const notificationCount = 3;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        storeName={storeName}
        notificationCount={notificationCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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

## Passo 5: Atualizar Estilos Globais

Adicionar ao `src/app/globals.css`:

```css
/* Safe area para dispositivos com notch */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Ajuste de altura considerando bottom nav */
.min-h-screen-safe {
  min-height: calc(100vh - env(safe-area-inset-bottom, 0px));
}
```

---

## Passo 6: Criar Página Home Básica

Criar `src/app/(dashboard)/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-header">Bom dia!</h1>
        <p className="text-body text-text-secondary">
          Aqui está o resumo do seu dia
        </p>
      </div>

      {/* Placeholder para estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-lg">
        <div className="card-default">
          <p className="text-caption text-text-secondary uppercase mb-xs">
            Vendas Hoje
          </p>
          <p className="text-title font-bold">12</p>
        </div>
        <div className="card-default">
          <p className="text-caption text-text-secondary uppercase mb-xs">
            Receita Hoje
          </p>
          <p className="text-title font-bold">R$ 2.450,00</p>
        </div>
        <div className="card-default">
          <p className="text-caption text-text-secondary uppercase mb-xs">
            Cashback Distribuído
          </p>
          <p className="text-title font-bold">R$ 122,50</p>
        </div>
      </div>

      {/* Placeholder para quick action */}
      <div className="card-highlight p-xl mb-lg cursor-pointer hover:bg-[#2a2a2a] transition-colors">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-md">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-subtitle font-bold text-white mb-xs">
            Registrar Nova Venda
          </h2>
          <p className="text-body text-white/70">
            Escaneie o QR Code ou digite o CPF
          </p>
        </div>
      </div>

      {/* Placeholder para vendas recentes */}
      <section>
        <div className="flex items-center justify-between mb-md">
          <h2 className="section-title">Últimas vendas</h2>
          <a href="/vendas" className="text-body text-primary font-medium">
            Ver todas →
          </a>
        </div>
        <div className="space-y-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-default flex items-center gap-md">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                JS
              </div>
              <div className="flex-1">
                <p className="font-semibold">João Silva</p>
                <p className="text-caption text-text-secondary">
                  14:32 • R$ 150,00
                </p>
              </div>
              <span className="text-success font-semibold">+R$ 7,50</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## Passo 7: Exportar Componentes de Layout

Criar `src/components/layout/index.ts`:

```typescript
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { MobileNav } from './MobileNav';
```

---

## Verificação

1. Executar o projeto: `npm run dev`
2. Acessar `http://localhost:3000`
3. Verificar:
   - Sidebar aparece no desktop (> 1024px)
   - Header e Bottom Nav aparecem no mobile (< 1024px)
   - Menu hamburger abre a sidebar no mobile
   - Navegação funciona corretamente
   - Item "Registrar Venda" está destacado

---

## Checklist

- [ ] Sidebar implementada com menu e logout
- [ ] Header mobile implementado
- [ ] Bottom Navigation implementada
- [ ] Dashboard Layout criado
- [ ] Responsividade funcionando
- [ ] Navegação ativa destacada
- [ ] Badge de notificações funcionando
- [ ] Página Home básica criada

---

## Próximo Passo

Seguir para [05-auth.md](./05-auth.md) para implementar o sistema de autenticação.
