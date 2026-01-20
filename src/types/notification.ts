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
