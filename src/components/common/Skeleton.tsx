import { cn } from '@/utils/cn';

export interface SkeletonProps {
  className?: string;
  rounded?: string;
}

/** Neutral shimmering placeholder used by every loading state. */
export function Skeleton({ className, rounded = 'rounded-xl' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton', rounded, className)}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2.5', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')}
          rounded="rounded-full"
        />
      ))}
    </div>
  );
}
