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
