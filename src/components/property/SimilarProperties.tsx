import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchSimilarProperties, queryKeys } from '@/services/propertyService';
import { PropertyGrid } from './PropertyGrid';

export interface SimilarPropertiesProps {
  propertyId: string;
  limit?: number;
}

/** Server-driven "you may also like" rail based on type, city and size. */
export function SimilarProperties({ propertyId, limit = 3 }: SimilarPropertiesProps) {
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.properties.similar(propertyId, limit),
    queryFn: ({ signal }) => fetchSimilarProperties(propertyId, limit, signal),
    staleTime: 60 * 1000,
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold sm:text-2xl">{t('details.similar')}</h2>
        <p className="mt-1.5 text-sm text-subtle">{t('details.similarSubtitle')}</p>
      </div>

      <PropertyGrid
        properties={data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        skeletonCount={limit}
        emptyTitle={t('details.similarEmpty')}
        emptyBody={t('explore.emptyBody')}
      />
    </div>
  );
}
