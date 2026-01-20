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
