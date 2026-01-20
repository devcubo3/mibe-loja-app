'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/types/notification';

// Dados mockados
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    store_id: 'mock-store-123',
    type: 'sale',
    title: 'Nova venda registrada',
    message: 'João Silva realizou uma compra de R$ 1.250,00',
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    store_id: 'mock-store-123',
    type: 'customer',
    title: 'Novo cliente cadastrado',
    message: 'Maria Santos se cadastrou na sua loja',
    read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    store_id: 'mock-store-123',
    type: 'info',
    title: 'Cliente atingiu meta de pontos',
    message: 'Pedro Oliveira acumulou 1.000 pontos!',
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(MOCK_NOTIFICATIONS.filter((n) => !n.read).length);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(() => {
    setNotifications(MOCK_NOTIFICATIONS);
    setUnreadCount(MOCK_NOTIFICATIONS.filter((n) => !n.read).length);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
