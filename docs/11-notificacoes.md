# 11 - Notificações

## Objetivo
Implementar a central de notificações com listagem e marcação como lida.

---

## Layout da Página

```
┌─────────────────────────────────────────────────────────────┐
│  Notificações                                               │
│                                                             │
│  Não lidas (2)                    Marcar todas como lida    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔵 ↓ Nova venda registrada           • 2 minutos atrás│ │
│  │      Você registrou uma venda de R$ 150,00           │ │
│  │      para João Silva Santos                      ✓   │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Anteriores                                                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    ↑ Resgate realizado               • Ontem         │ │
│  │      Maria Santos resgatou R$ 25,00 em compra        │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Passo 1: Criar Tipos de Notificação

Criar `src/types/notification.ts`:

```typescript
export type NotificationType =
  | 'sale'       // Nova venda
  | 'redeem'     // Resgate de saldo
  | 'warning'    // Aviso de expiração
  | 'info'       // Informações gerais
  | 'customer';  // Novo cliente

export interface Notification {
  id: string;
  store_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: {
    sale_id?: string;
    customer_id?: string;
    amount?: number;
  };
  created_at: string;
}

export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: string; color: string; bgColor: string }
> = {
  sale: {
    icon: 'ArrowDown',
    color: '#34C759',
    bgColor: '#E8F5E9',
  },
  redeem: {
    icon: 'ArrowUp',
    color: '#FF3B30',
    bgColor: '#FFEBEE',
  },
  warning: {
    icon: 'AlertCircle',
    color: '#FF9500',
    bgColor: '#FFF3E0',
  },
  info: {
    icon: 'Info',
    color: '#181818',
    bgColor: '#F5F5F5',
  },
  customer: {
    icon: 'UserPlus',
    color: '#181818',
    bgColor: '#F5F5F5',
  },
};
```

---

## Passo 2: Criar Hook useNotifications

Criar `src/hooks/useNotifications.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Notification } from '@/types/notification';

export function useNotifications() {
  const { store } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!store?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }

    setIsLoading(false);
  }, [store?.id]);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!store?.id) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('store_id', store.id)
        .eq('read', false);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  useEffect(() => {
    if (store?.id) {
      fetchNotifications();

      // Subscription para novas notificações em tempo real
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `store_id=eq.${store.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [store?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
```

---

## Passo 3: Criar Componente NotificationItem

Criar `src/components/notifications/NotificationItem.tsx`:

```tsx
'use client';

import {
  ArrowDown,
  ArrowUp,
  AlertCircle,
  Info,
  UserPlus,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import type { Notification, NotificationType } from '@/types/notification';

const icons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  sale: ArrowDown,
  redeem: ArrowUp,
  warning: AlertCircle,
  info: Info,
  customer: UserPlus,
};

const colors: Record<NotificationType, { icon: string; bg: string }> = {
  sale: { icon: 'text-success', bg: 'bg-success-light' },
  redeem: { icon: 'text-error', bg: 'bg-error-light' },
  warning: { icon: 'text-warning', bg: 'bg-warning-light' },
  info: { icon: 'text-text-primary', bg: 'bg-input-bg' },
  customer: { icon: 'text-text-primary', bg: 'bg-input-bg' },
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const Icon = icons[notification.type];
  const colorConfig = colors[notification.type];

  return (
    <div
      className={cn(
        'flex items-start gap-md p-md border-b border-input-border last:border-0',
        !notification.read && 'bg-white'
      )}
    >
      {/* Unread Indicator */}
      <div className="w-2 pt-5">
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-primary" />
        )}
      </div>

      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
          colorConfig.bg
        )}
      >
        <Icon className={cn('w-5 h-5', colorConfig.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-sm">
          <p className="font-semibold text-text-primary text-body">
            {notification.title}
          </p>
          <span className="text-caption text-text-muted whitespace-nowrap">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>
        <p className="text-body text-text-secondary mt-xs">
          {notification.message}
        </p>
      </div>

      {/* Mark as Read Button */}
      {!notification.read && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="w-9 h-9 rounded-full bg-input-bg flex items-center justify-center hover:bg-input-border transition-colors flex-shrink-0"
          title="Marcar como lida"
        >
          <Check className="w-4 h-4 text-text-muted" />
        </button>
      )}
    </div>
  );
}
```

---

## Passo 4: Criar Página de Notificações

Criar `src/app/(dashboard)/notificacoes/page.tsx`:

```tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { EmptyState, Skeleton } from '@/components/ui';
import { Bell } from 'lucide-react';

export default function NotificacoesPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-md">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-md p-md">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="text-title font-bold">Notificações</h1>
        </div>
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="Nenhuma notificação"
          description="Você não tem notificações no momento"
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <h1 className="text-title font-bold">Notificações</h1>
      </div>

      {/* Unread Section */}
      {unreadNotifications.length > 0 && (
        <section className="mb-lg">
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-body font-semibold text-text-secondary">
              Não lidas ({unreadCount})
            </h2>
            <button
              onClick={markAllAsRead}
              className="text-body text-primary hover:underline"
            >
              Marcar todas como lida
            </button>
          </div>

          <div className="bg-white border border-input-border rounded-md overflow-hidden">
            {unreadNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        </section>
      )}

      {/* Read Section */}
      {readNotifications.length > 0 && (
        <section>
          <h2 className="text-body font-semibold text-text-secondary mb-md">
            Anteriores
          </h2>

          <div className="bg-input-bg rounded-md overflow-hidden">
            {readNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## Passo 5: Exportar Componentes

Criar `src/components/notifications/index.ts`:

```typescript
export { NotificationItem } from './NotificationItem';
```

---

## Passo 6: Atualizar Layout para usar Notificações

Atualizar `src/app/(dashboard)/layout.tsx` para usar o hook:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { store, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-md w-full max-w-md p-lg">
          <Skeleton className="h-12 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        storeName={store?.name || 'Minha Loja'}
        notificationCount={unreadCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="lg:ml-sidebar">
        <Header
          notificationCount={unreadCount}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="pb-24 lg:pb-0">{children}</main>

        <MobileNav onMoreClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}
```

---

## Passo 7: Tabela no Supabase

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) NOT NULL,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_store_id ON notifications(store_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can view own notifications" ON notifications
  FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

CREATE POLICY "Stores can update own notifications" ON notifications
  FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

-- Trigger para criar notificação ao registrar venda
CREATE OR REPLACE FUNCTION create_sale_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (store_id, type, title, message, data)
  VALUES (
    NEW.store_id,
    'sale',
    'Nova venda registrada',
    'Você registrou uma venda de R$ ' || NEW.purchase_amount || ' para ' || NEW.customer_name,
    jsonb_build_object('sale_id', NEW.id, 'amount', NEW.purchase_amount)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_sale_created
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION create_sale_notification();
```

---

## Checklist

- [ ] Tipos de notificação criados
- [ ] Hook useNotifications implementado
- [ ] NotificationItem com ícones e cores
- [ ] Página de notificações implementada
- [ ] Separação entre lidas e não lidas
- [ ] Marcar como lida (individual e todas)
- [ ] Realtime subscription funcionando
- [ ] Badge de notificações atualizado no layout
- [ ] Tabela e trigger no Supabase

---

## Próximo Passo

Seguir para [12-pwa.md](./12-pwa.md) para configurar o Progressive Web App.
