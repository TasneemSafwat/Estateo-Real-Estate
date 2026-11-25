import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { GitCompareArrows, Trash2 } from 'lucide-react';
import { fetchPropertiesByIds, queryKeys } from '@/services/propertyService';
import { useComparison } from '@/hooks/useComparison';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/utils/constants';
import { Button, buttonStyles } from '@/components/common/Button';
import { Container, Section } from '@/components/common/Section';
import { EmptyState } from '@/components/common/Feedback';
import { Skeleton } from '@/components/common/Skeleton';
import { CompareTable } from '@/components/property/CompareTable';

/** Side-by-side comparison workspace for the selected shortlist. */
export default function ComparePage() {
  const { t } = useTranslation();
  const { ids, remove, clear, limit } = useComparison();
  const toast = useToast();

  useDocumentTitle({ title: t('compare.title'), description: t('compare.subtitle') });

  const orderedIds = useMemo(() => [...ids], [ids]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.properties.byIds(orderedIds),
    queryFn: ({ signal }) => fetchPropertiesByIds(orderedIds, signal),
    enabled: orderedIds.length > 0,
    staleTime: 30 * 1000,
  });

  const properties = useMemo(() => {
    const fetched = data ?? [];
    // Keep the user's selection order once the records resolve.
    return orderedIds
      .map((id) => fetched.find((property) => property.id === id))
      .filter((property): property is NonNullable<typeof property> => Boolean(property));
  }, [data, orderedIds]);

  return (
    <Section spacing="md" className="pt-28 lg:pt-32">
      <Container>
        <header className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-eyebrow mb-3">{t('nav.compare')}</p>
            <h1 className="text-2xl leading-tight sm:text-[2rem]">{t('compare.title')}</h1>
            <p className="mt-3 text-[0.9375rem] text-subtle">{t('compare.subtitle')}</p>
          </div>

          {orderedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm text-subtle">
                {orderedIds.length}/{limit}
              </span>
              <Button
                variant="ghost"
                leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                onClick={() => {
                  clear();
                  toast.info(t('dashboard.compareEmpty'));
                }}
              >
                {t('common.clearAll')}
              </Button>
            </div>
          )}
        </header>

        {orderedIds.length === 0 ? (
          <EmptyState
            title={t('compare.empty')}
            description={t('compare.emptyBody')}
            icon={<GitCompareArrows className="h-6 w-6" aria-hidden="true" />}
            action={
              <Link to={ROUTES.explore} className={buttonStyles({ variant: 'primary' })}>
                {t('compare.ctaBrowse')}
              </Link>
            }
          />
        ) : orderedIds.length === 1 ? (
          <EmptyState
            title={t('compare.onlyOne')}
            description={t('compare.emptyBody')}
            icon={<GitCompareArrows className="h-6 w-6" aria-hidden="true" />}
            action={
              <Link to={ROUTES.explore} className={buttonStyles({ variant: 'primary' })}>
                {t('compare.ctaBrowse')}
              </Link>
            }
          />
        ) : isLoading ? (
          <Skeleton className="h-[32rem] w-full rounded-3xl" />
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
      </Container>
    </Section>
  );
}
