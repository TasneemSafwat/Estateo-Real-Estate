import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { History, Trash2 } from 'lucide-react';
import { fetchPropertiesByIds, queryKeys } from '@/services/propertyService';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/utils/constants';
import { Button, buttonStyles } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PropertyGrid } from '@/components/property/PropertyGrid';

/** History of properties the buyer has opened, newest first. */
export default function RecentlyViewedPage() {
  const { t } = useTranslation();
  const { ids, count, clear } = useRecentlyViewed();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.properties.byIds(ids),
    queryFn: ({ signal }) => fetchPropertiesByIds(ids, signal),
    enabled: ids.length > 0,
    staleTime: 30 * 1000,
  });

  const handleClear = () => {
    clear();
    setConfirmOpen(false);
    toast.info(t('dashboard.historyCleared'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t('dashboard.recentlyViewed')}</h2>
          <p className="mt-1 text-sm text-subtle">{t('common.results', { count })}</p>
        </div>
        {count > 0 && (
          <Button
            variant="ghost"
            leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            onClick={() => setConfirmOpen(true)}
          >
            {t('dashboard.clearRecentlyViewed')}
          </Button>
        )}
      </div>

      <PropertyGrid
        properties={data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        skeletonCount={3}
        emptyTitle={t('dashboard.recentEmpty')}
        emptyBody={t('explore.subtitle')}
        emptyAction={
          <Link to={ROUTES.explore} className={buttonStyles({ variant: 'primary' })}>
            <History className="h-4 w-4" aria-hidden="true" />
            {t('compare.ctaBrowse')}
          </Link>
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t('dashboard.clearRecentlyViewed')}
        description={t('dashboard.clearHistoryConfirm')}
        confirmLabel={t('common.clearAll')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleClear}
      />
    </div>
  );
}
