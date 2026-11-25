import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { GitCompareArrows, Trash2 } from 'lucide-react';
import { fetchPropertiesByIds, queryKeys } from '@/services/propertyService';
import { useComparison } from '@/hooks/useComparison';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/utils/constants';
import { Button, buttonStyles } from '@/components/common/Button';
import { EmptyState } from '@/components/common/Feedback';
import { Skeleton } from '@/components/common/Skeleton';
import { CompareTable } from '@/components/property/CompareTable';

/** Comparison workspace embedded in the buyer dashboard. */
export default function DashboardComparePage() {
  const { t } = useTranslation();
  const { ids, remove, clear, limit } = useComparison();
  const toast = useToast();

  const orderedIds = useMemo(() => [...ids], [ids]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.properties.byIds(orderedIds),
    queryFn: ({ signal }) => fetchPropertiesByIds(orderedIds, signal),
    enabled: orderedIds.length > 0,
    staleTime: 30 * 1000,
  });

  const properties = useMemo(() => {
    const fetched = data ?? [];
    return orderedIds
      .map((id) => fetched.find((property) => property.id === id))
      .filter((property): property is NonNullable<typeof property> => Boolean(property));
  }, [data, orderedIds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t('dashboard.comparison')}</h2>
          <p className="mt-1 text-sm text-subtle">
            {orderedIds.length}/{limit} · {t('compare.subtitle')}
          </p>
        </div>
        {orderedIds.length > 0 && (
          <Button
            variant="ghost"
            leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            onClick={() => {
              clear();
              toast.info(t('compare.removed'));
            }}
          >
            {t('common.clearAll')}
          </Button>
        )}
      </div>

      {orderedIds.length < 2 ? (
        <EmptyState
          title={t('dashboard.compareEmpty')}
          description={t('compare.emptyBody')}
          icon={<GitCompareArrows className="h-6 w-6" aria-hidden="true" />}
          action={
            <Link to={ROUTES.explore} className={buttonStyles({ variant: 'primary' })}>
              {t('compare.ctaBrowse')}
            </Link>
          }
        />
      ) : isLoading ? (
        <Skeleton className="h-[30rem] w-full rounded-3xl" />
      ) : isError ? (
        <EmptyState
          title={t('explore.errorTitle')}
          description={t('explore.errorBody')}
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : (
        <CompareTable properties={properties} onRemove={remove} />
      )}
    </div>
  );
}
