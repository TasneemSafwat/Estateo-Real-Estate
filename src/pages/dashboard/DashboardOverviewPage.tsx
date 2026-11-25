import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bell, GitCompareArrows, Heart, History, PlusCircle } from 'lucide-react';
import { fetchPropertiesByIds, queryKeys } from '@/services/propertyService';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useComparison } from '@/hooks/useComparison';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ROUTES } from '@/utils/constants';
import { StatCard } from '@/components/common/StatCard';
import { buttonStyles } from '@/components/common/Button';
import { SectionHeading } from '@/components/common/Section';
import { PropertyGrid } from '@/components/property/PropertyGrid';

const PREVIEW_COUNT = 3;

/** Buyer dashboard landing: KPIs plus a preview of the shortlist. */
export default function DashboardOverviewPage() {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const { ids: favoriteIds, count: favoriteCount } = useFavorites();
  const { count: comparisonCount } = useComparison();
  const { count: recentCount } = useRecentlyViewed();

  const previewIds = useMemo(() => favoriteIds.slice(0, PREVIEW_COUNT), [favoriteIds]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.properties.byIds(previewIds),
    queryFn: ({ signal }) => fetchPropertiesByIds(previewIds, signal),
    enabled: previewIds.length > 0,
    staleTime: 30 * 1000,
  });

  const alerts = user
    ? (user.preferences.priceAlerts ? 1 : 0) + (user.preferences.weeklyDigest ? 1 : 0)
    : 0;

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dashboard.statsSaved')}
          value={String(favoriteCount)}
          icon={<Heart className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label={t('dashboard.statsViews')}
          value={String(recentCount)}
          icon={<History className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label={t('dashboard.statsCompare')}
          value={String(comparisonCount)}
          icon={<GitCompareArrows className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label={t('dashboard.statsAlerts')}
          value={String(alerts)}
          icon={<Bell className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link to={ROUTES.explore} className={buttonStyles({ variant: 'primary', size: 'md' })}>
          {t('compare.ctaBrowse')}
        </Link>
        <Link
          to={ROUTES.dashboardSaved}
          className={buttonStyles({ variant: 'outline', size: 'md' })}
        >
          {t('dashboard.savedProperties')}
        </Link>
        {isAdmin && (
          <Link
            to={ROUTES.adminPropertyNew}
            className={buttonStyles({ variant: 'ghost', size: 'md' })}
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            {t('admin.addProperty')}
          </Link>
        )}
      </div>

      <section>
        <SectionHeading
          title={t('dashboard.savedProperties')}
          description={t('home.featuredSubtitle')}
          action={
            <Link
              to={ROUTES.dashboardSaved}
              className="link-underline text-sm font-semibold text-ink"
            >
              {t('common.viewAll')}
            </Link>
          }
        />

        {previewIds.length === 0 ? (
          <EmptyShortlist />
        ) : (
          <PropertyGrid
            properties={data ?? []}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            skeletonCount={PREVIEW_COUNT}
          />
        )}
      </section>
    </div>
  );
}

function EmptyShortlist() {
  const { t } = useTranslation();
  return (
    <div className="rounded-3xl border border-dashed border-line bg-panel/60 px-6 py-12 text-center">
      <p className="text-sm text-subtle">{t('dashboard.savedEmpty')}</p>
      <Link
        to={ROUTES.explore}
        className={buttonStyles({ variant: 'primary', size: 'sm', className: 'mt-5' })}
      >
        {t('dashboard.savedEmptyCta')}
      </Link>
    </div>
  );
}
