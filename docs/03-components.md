# 03 - Componentes UI

## Objetivo
Criar componentes reutilizáveis seguindo o design system estabelecido.

---

## Lista de Componentes

1. [Button](#button)
2. [Input](#input)
3. [SearchInput](#searchinput)
4. [Card](#card)
5. [Badge](#badge)
6. [Modal](#modal)
7. [Skeleton](#skeleton)
8. [Avatar](#avatar)
9. [Divider](#divider)
10. [EmptyState](#emptystate)

---

## Button

Criar `src/components/ui/Button.tsx`:

```tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-semibold rounded-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary text-white hover:bg-[#2a2a2a] active:bg-[#333333]',
      secondary: 'bg-white text-primary border border-primary hover:bg-input-bg active:bg-[#EBEBEB]',
      danger: 'bg-white text-error border border-error hover:bg-error-light active:bg-error active:text-white',
      ghost: 'bg-transparent text-primary hover:bg-input-bg active:bg-[#EBEBEB]',
    };

    const sizes = {
      sm: 'h-input-sm px-4 text-body',
      md: 'h-input px-6 text-body-lg',
      lg: 'h-[64px] px-8 text-subtitle',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

---

## Input

Criar `src/components/ui/Input.tsx`:

```tsx
import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showPasswordToggle?: boolean;
  readOnly?: boolean;
  showLockIcon?: boolean;
  onChange?: (value: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      showPasswordToggle = false,
      readOnly = false,
      showLockIcon = false,
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="label-default">{label}</label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              'input-default',
              error && 'input-error',
              icon && iconPosition === 'left' && 'pl-12',
              (icon && iconPosition === 'right') || showPasswordToggle || showLockIcon
                ? 'pr-12'
                : '',
              readOnly && 'opacity-60 cursor-not-allowed',
              className
            )}
            disabled={disabled}
            readOnly={readOnly}
            onChange={handleChange}
            {...props}
          />

          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}

          {showLockIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
              <Lock className="w-4 h-4" />
            </div>
          )}

          {icon && iconPosition === 'right' && !showPasswordToggle && !showLockIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
        </div>

        {error && <span className="error-message">{error}</span>}
        {helperText && !error && <span className="helper-text">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

---

## SearchInput

Criar `src/components/ui/SearchInput.tsx`:

```tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, placeholder = 'Buscar...', ...props }, ref) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-input-sm w-full pl-12 pr-10 bg-input-bg border border-input-border rounded-sm',
            'text-body text-text-primary placeholder:text-text-muted',
            'focus:border-primary focus:outline-none transition-colors',
            className
          )}
          {...props}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
```

---

## Card

Criar `src/components/ui/Card.tsx`:

```tsx
import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'filled' | 'outlined' | 'highlight';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white border border-input-border',
      filled: 'bg-input-bg',
      outlined: 'bg-transparent border border-input-border',
      highlight: 'bg-primary text-white',
    };

    const paddings = {
      none: '',
      sm: 'p-sm',
      md: 'p-md',
      lg: 'p-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md',
          variants[variant],
          paddings[padding],
          hoverable && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Sub-components
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-md', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-subtitle font-semibold', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-md pt-md border-t border-input-border', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
```

---

## Badge

Criar `src/components/ui/Badge.tsx`:

```tsx
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
```

---

## Modal

Criar `src/components/ui/Modal.tsx`:

```tsx
'use client';

import { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className={cn(
            'relative bg-white w-full rounded-t-lg sm:rounded-lg shadow-xl',
            'animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200',
            sizes[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar (mobile) */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-input-border rounded-full" />
          </div>

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-lg pt-md pb-md border-b border-input-border">
              {title && (
                <h2 className="text-subtitle font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-input-bg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-lg py-lg max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

// Componentes auxiliares para o Modal
export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-md mt-lg pt-lg border-t border-input-border', className)}>
      {children}
    </div>
  );
}
```

---

## Skeleton

Criar `src/components/ui/Skeleton.tsx`:

```tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-input-bg rounded',
        className
      )}
    />
  );
}

// Variantes pré-definidas
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('card-default space-y-md', className)}>
      <div className="flex items-center gap-md">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <Skeleton className={cn('rounded-full', sizes[size])} />;
}
```

---

## Avatar

Criar `src/components/ui/Avatar.tsx`:

```tsx
import { forwardRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, src, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-caption',
      md: 'w-12 h-12 text-body',
      lg: 'w-16 h-16 text-body-lg',
      xl: 'w-20 h-20 text-title',
    };

    const initial = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (src) {
      return (
        <div
          ref={ref}
          className={cn('rounded-full overflow-hidden', sizes[size], className)}
        >
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            {...props}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full bg-primary text-white font-bold flex items-center justify-center',
          sizes[size],
          className
        )}
      >
        {initial}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
```

---

## Divider

Criar `src/components/ui/Divider.tsx`:

```tsx
import { cn } from '@/lib/utils';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  text?: string;
}

export function Divider({ orientation = 'horizontal', className, text }: DividerProps) {
  if (text) {
    return (
      <div className={cn('flex items-center gap-md', className)}>
        <div className="flex-1 h-px bg-input-border" />
        <span className="text-caption text-text-muted">{text}</span>
        <div className="flex-1 h-px bg-input-border" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        'bg-input-border',
        className
      )}
    />
  );
}
```

---

## EmptyState

Criar `src/components/ui/EmptyState.tsx`:

```tsx
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
```

---

## Exportar Todos os Componentes

Criar `src/components/ui/index.ts`:

```typescript
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
export type { CardProps } from './Card';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { Modal, ModalFooter } from './Modal';
export type { ModalProps } from './Modal';

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar } from './Skeleton';

export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

export { Divider } from './Divider';

export { EmptyState } from './EmptyState';
```

---

## Checklist

- [ ] Button implementado com todas variantes
- [ ] Input implementado com suporte a máscaras
- [ ] SearchInput implementado
- [ ] Card e sub-componentes implementados
- [ ] Badge implementado
- [ ] Modal implementado
- [ ] Skeleton e variantes implementados
- [ ] Avatar implementado
- [ ] Divider implementado
- [ ] EmptyState implementado
- [ ] Todos exportados no index.ts

---

## Próximo Passo

Seguir para [04-layout.md](./04-layout.md) para criar a estrutura de layout (Sidebar, Header, Mobile Nav).
