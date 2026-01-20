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
