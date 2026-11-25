import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Property } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState, ErrorState } from '@/components/common/Feedback';
import { PropertyCard } from './PropertyCard';

export interface PropertyGridProps {
  properties: Property[];
  view?: 'grid' | 'list';
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyBody?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  priorityCount?: number;
}

function CardSkeleton({ view }: { view: 'grid' | 'list' }) {
  return (
    <div className={cn('surface-card overflow-hidden', view === 'list' && 'sm:flex')}>
      <div className={cn('skeleton aspect-[4/3]', view === 'list' && 'sm:h-auto sm:w-[42%]')} />
      <div className="flex-1 space-y-3 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <div className="flex gap-3 border-t border-line pt-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the listing collection with a consistent layout, loading skeletons
 * and empty/error surfaces so results never collapse into a blank region.
 */
export function PropertyGrid({
  properties,
  view = 'grid',
  isLoading = false,
  isError = false,
  onRetry,
  skeletonCount = 6,
  emptyTitle,
  emptyBody,
  emptyAction,
  className,
  priorityCount = 3,
}: PropertyGridProps) {
  const { t } = useTranslation();

  if (isError) {
    return (
      <ErrorState
        title={t('explore.errorTitle')}
        description={t('explore.errorBody')}
        {...(onRetry ? { onRetry, retryLabel: t('common.retry') } : {})}
        className={className}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'grid gap-6',
          view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
          className,
        )}
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <CardSkeleton key={index} view={view} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? t('common.noResults')}
        description={emptyBody ?? t('explore.emptyBody')}
        icon={<Building2 className="h-6 w-6" aria-hidden="true" />}
        {...(emptyAction ? { action: emptyAction } : {})}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid gap-6',
        view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
        className,
      )}
    >
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          variant={view}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
