'use client';

import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, NotificationType } from '@/types/notification';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

// Store persistente para notificações
const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Manter máximo de 50
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },
    }),
    {
      name: 'mibe-notifications-storage',
    }
  )
);

export function useNotifications() {
  const store = useNotificationsStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(() => {
    // As notificações já estão no store persistido
    setIsLoading(false);
  }, []);

  // Função para criar notificação de nova venda
  const notifySale = useCallback((customerName: string, amount: number, saleId?: string) => {
    store.addNotification({
      store_id: 'current',
      type: 'sale',
      title: 'Nova venda registrada',
      message: `${customerName} realizou uma compra de R$ ${amount.toFixed(2).replace('.', ',')}`,
      data: { sale_id: saleId, amount },
    });
  }, [store]);

  // Função para criar notificação de resgate
  const notifyRedeem = useCallback((customerName: string, amount: number) => {
    store.addNotification({
      store_id: 'current',
      type: 'redeem',
      title: 'Cashback resgatado',
      message: `${customerName} usou R$ ${amount.toFixed(2).replace('.', ',')} de saldo`,
      data: { amount },
    });
  }, [store]);

  // Função para criar notificação de novo cliente
  const notifyNewCustomer = useCallback((customerName: string, customerId?: string) => {
    store.addNotification({
      store_id: 'current',
      type: 'customer',
      title: 'Novo cliente',
      message: `${customerName} fez sua primeira compra na loja`,
      data: { customer_id: customerId },
    });
  }, [store]);

  // Função para criar notificação de aviso
  const notifyWarning = useCallback((title: string, message: string) => {
    store.addNotification({
      store_id: 'current',
      type: 'warning',
      title,
      message,
    });
  }, [store]);

  // Função para criar notificação informativa
  const notifyInfo = useCallback((title: string, message: string) => {
    store.addNotification({
      store_id: 'current',
      type: 'info',
      title,
      message,
    });
  }, [store]);

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    clearAll: store.clearAll,
    removeNotification: store.removeNotification,
    // Funções para criar notificações
    notifySale,
    notifyRedeem,
    notifyNewCustomer,
    notifyWarning,
    notifyInfo,
  };
}
