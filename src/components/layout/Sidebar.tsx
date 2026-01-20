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
  User,
  LogOut,
  X,
  MessageCircle,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
  storeName?: string;
  notificationCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
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
    label: 'Suporte',
    href: '/suporte',
    icon: MessageCircle,
  },
  {
    label: 'Minha Conta',
    href: '/minha-conta',
    icon: User,
  },
];

export function Sidebar({
  storeName = 'Minha Loja',
  notificationCount = 0,
  isOpen = false,
  onClose,
  onLogout,
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
          'lg:translate-x-0',
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

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      item.highlight && !active ? 'sidebar-item-highlight' : 
                      active ? 'sidebar-item-active' : 
                      'sidebar-item'
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
                  onLogout?.();
                  onClose?.();
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
