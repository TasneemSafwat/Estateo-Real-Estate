import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RatingProps {
  value: number;
  reviewsCount?: number;
  size?: 'sm' | 'md';
  className?: string;
  showValue?: boolean;
}

/** Five-star rating display with an accessible text alternative. */
export function Rating({ value, reviewsCount, size = 'sm', className, showValue = true }: RatingProps) {
  const rounded = Math.round(value * 2) / 2;
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className="inline-flex items-center gap-0.5"
        role="img"
        aria-label={`Rated ${value.toFixed(1)} out of 5${reviewsCount ? ` from ${reviewsCount} reviews` : ''}`}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index + 1 <= rounded;
          const half = !filled && index + 0.5 === rounded;
          return (
            <Star
              key={index}
              aria-hidden="true"
              className={cn(
                starSize,
                filled || half
                  ? 'fill-accent-500 text-accent-500'
                  : 'fill-transparent text-subtle/45',
              )}
            />
          );
        })}
      </span>
      {showValue && (
        <span className="text-xs font-semibold text-ink/80">
          {value.toFixed(1)}
          {reviewsCount !== undefined && (
            <span className="font-normal text-subtle"> ({reviewsCount})</span>
          )}
        </span>
      )}
    </span>
  );
}
