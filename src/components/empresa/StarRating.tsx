'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-caption',
    md: 'text-body',
    lg: 'text-body-lg',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {/* Estrelas cheias */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(sizes[size], 'text-star fill-star')}
          />
        ))}

        {/* Meia estrela */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={cn(sizes[size], 'text-gray-300')} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={cn(sizes[size], 'text-star fill-star')} />
            </div>
          </div>
        )}

        {/* Estrelas vazias */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(sizes[size], 'text-gray-300')}
          />
        ))}
      </div>

      {showValue && (
        <span className={cn(textSizes[size], 'font-semibold text-text-primary ml-1')}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
