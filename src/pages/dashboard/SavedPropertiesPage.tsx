import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { fetchPropertiesByIds, queryKeys } from '@/services/propertyService';
import { useFavorites } from '@/hooks/useFavorites';
import { ROUTES } from '@/utils/constants';
import { buttonStyles } from '@/components/common/Button';
import { PropertyGrid } from '@/components/property/PropertyGrid';

/** The signed-in buyer's shortlist, backed by localStorage. */
export default function SavedPropertiesPage() {
  const { t } = useTranslation();
  const { ids, count } = useFavorites();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.properties.byIds(ids),
    queryFn: ({ signal }) => fetchPropertiesByIds(ids, signal),
    enabled: ids.length > 0,
    staleTime: 30 * 1000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t('dashboard.savedProperties')}</h2>
        <p className="mt-1 text-sm text-subtle">{t('common.results', { count })}</p>
      </div>

      <PropertyGrid
        properties={data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        skeletonCount={3}
        emptyTitle={t('dashboard.savedEmpty')}
        emptyBody={t('details.similarSubtitle')}
        emptyAction={
          <Link to={ROUTES.explore} className={buttonStyles({ variant: 'primary' })}>
            <Heart className="h-4 w-4" aria-hidden="true" />
            {t('dashboard.savedEmptyCta')}
          </Link>
        }
      />
    </div>
  );
}
