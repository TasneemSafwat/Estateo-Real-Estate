import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Banknote,
  Building2,
  CheckCircle2,
  RefreshCcw,
  Tag,
  Users,
} from 'lucide-react';
import { fetchAdminDashboard, queryKeys, resetPropertyCatalog } from '@/services/propertyService';
import { fetchActivity } from '@/services/userService';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/useToast';
import { formatCompactNumber } from '@/utils/format';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/common/StatCard';
import { Skeleton } from '@/components/common/Skeleton';
import { ErrorState } from '@/components/common/Feedback';
import {
  ActivityFeed,
  DistributionChart,
  EngagementChart,
  RevenueChart,
} from '@/components/admin';

/** Admin landing: KPIs, analytics charts and recent activity. */
export default function AdminOverviewPage() {
  const { t, i18n } = useTranslation();
  const { format } = useCurrency();
  const toast = useToast();
  const queryClient = useQueryClient();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  const dashboardQuery = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: ({ signal }) => fetchAdminDashboard(signal),
    staleTime: 30 * 1000,
  });

  const activityQuery = useQuery({
    queryKey: queryKeys.admin.activity,
    queryFn: ({ signal }) => fetchActivity(signal),
    staleTime: 30 * 1000,
  });

  const resetMutation = useMutation({
    mutationFn: resetPropertyCatalog,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success(t('admin.resetDone'));
    },
    onError: () => toast.error(t('common.error')),
  });

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <ErrorState
        onRetry={() => void dashboardQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  const { stats, revenue, distribution, engagement } = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          isLoading={resetMutation.isPending}
          loadingLabel={t('common.loading')}
          leftIcon={<RefreshCcw className="h-4 w-4" aria-hidden="true" />}
          onClick={() => resetMutation.mutate()}
          title={t('admin.resetDemoBody')}
        >
          {t('admin.resetDemo')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label={t('admin.totalProperties')}
          value={formatCompactNumber(stats.totalProperties, locale)}
          trend={stats.propertyTrend}
          icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label={t('admin.totalUsers')}
          value={formatCompactNumber(stats.totalUsers, locale)}
          trend={stats.userTrend}
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label={t('admin.activeListings')}
          value={formatCompactNumber(stats.activeListings, locale)}
          trend={stats.listingTrend}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label={t('admin.totalRevenue')}
          value={format(stats.totalRevenue, 'USD', { compact: true })}
          trend={stats.revenueTrend}
          icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label={t('admin.avgPrice')}
          value={format(stats.averagePrice, 'USD', { compact: true })}
          icon={<Tag className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <section className="surface-card p-6">
        <h2 className="mb-5 text-lg font-semibold">{t('admin.revenueChart')}</h2>
        <RevenueChart data={revenue} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-6">
          <h2 className="mb-5 text-lg font-semibold">{t('admin.distributionChart')}</h2>
          <DistributionChart data={distribution} />
        </section>
        <section className="surface-card p-6">
          <h2 className="mb-5 text-lg font-semibold">{t('admin.engagementChart')}</h2>
          <EngagementChart data={engagement} />
        </section>
      </div>

      <section className="surface-card p-6">
        <h2 className="mb-5 text-lg font-semibold">{t('admin.recentActivity')}</h2>
        {activityQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : activityQuery.isError ? (
          <ErrorState
            onRetry={() => void activityQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        ) : (
          <ActivityFeed entries={activityQuery.data ?? []} />
        )}
      </section>
    </div>
  );
}
