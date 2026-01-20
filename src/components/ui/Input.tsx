import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showPasswordToggle?: boolean;
  readOnly?: boolean;
  showLockIcon?: boolean;
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
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

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
