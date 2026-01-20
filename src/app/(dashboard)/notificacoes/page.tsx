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
