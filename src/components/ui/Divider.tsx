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
