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
