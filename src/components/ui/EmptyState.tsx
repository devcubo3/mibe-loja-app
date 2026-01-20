import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-xl text-center',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center text-text-muted mb-md">
          {icon}
        </div>
      )}
      <h3 className="text-subtitle font-semibold text-text-primary mb-xs">
        {title}
      </h3>
      {description && (
        <p className="text-body text-text-secondary max-w-sm mb-md">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
