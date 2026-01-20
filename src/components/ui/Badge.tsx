import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'dark' | 'success' | 'error' | 'warning' | 'light';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'dark', ...props }, ref) => {
    const variants = {
      dark: 'bg-primary text-white',
      success: 'bg-success text-white',
      error: 'bg-error text-white',
      warning: 'bg-warning text-white',
      light: 'bg-input-bg text-text-secondary',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-1 text-caption font-medium rounded-sm',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
