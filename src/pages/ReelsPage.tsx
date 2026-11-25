import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Clapperboard, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Agent, ListingType } from '@/types';
import { fetchAgents, fetchReelProperties, queryKeys } from '@/services/propertyService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { buttonStyles } from '@/components/common/Button';
import { EmptyState, ErrorState, Spinner } from '@/components/common/Feedback';
import { Logo } from '@/components/layout/Logo';
import { ReelsFeed } from '@/components/reels';
import { ROUTES } from '@/utils/constants';

type Filter = 'all' | ListingType;

/**
 * Video-commerce feed: full-screen vertical property tours with price,
 * advisor and booking on every reel.
 */
export default function ReelsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');
  const [searchParams] = useSearchParams();
  const startId = searchParams.get('start') ?? undefined;
  useLockBodyScroll(true);

  useDocumentTitle({ title: t('reels.title'), description: t('reels.subtitle') });

  const reels = useQuery({
    queryKey: queryKeys.properties.reels(12),
    queryFn: ({ signal }) => fetchReelProperties(12, signal),
  });
  const agents = useQuery({
    queryKey: queryKeys.catalog.agents,
    queryFn: ({ signal }) => fetchAgents(signal),
  });

  const agentMap = useMemo(
    () => new Map<string, Agent>((agents.data ?? []).map((agent) => [agent.id, agent])),
    [agents.data],
  );

  const visible = useMemo(
    () =>
      (reels.data ?? []).filter((property) => filter === 'all' || property.listingType === filter),
    [reels.data, filter],
  );

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: t('reels.all') },
    { value: 'sale', label: t('reels.buy') },
    { value: 'rent', label: t('reels.rent') },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-brand-950 text-white">
      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-3 pt-3 sm:px-5 sm:pt-4">
        <Link to={ROUTES.home} className="pointer-events-auto hidden sm:inline-flex" aria-label="Estateo">
          <Logo inverted />
        </Link>

        <div
          role="tablist"
          aria-label={t('reels.title')}
          className="pointer-events-auto flex rounded-full border border-white/20 bg-brand-950/55 p-1 backdrop-blur-md sm:absolute sm:start-1/2 sm:-translate-x-1/2 rtl:sm:translate-x-1/2"
        >
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition',
                filter === item.value
                  ? 'bg-white text-brand-900'
                  : 'text-white/80 hover:text-white',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Link
          to={ROUTES.home}
          aria-label={t('reels.close')}
          title={t('reels.close')}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-brand-950/55 backdrop-blur-md transition hover:bg-white/20"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Link>
      </header>

      {reels.isPending ? (
        <div className="flex h-full items-center justify-center" role="status" aria-live="polite">
          <Spinner className="h-7 w-7 text-white/70" />
        </div>
      ) : reels.isError ? (
        <div className="flex h-full items-center justify-center p-6">
          <ErrorState
            onRetry={() => void reels.refetch()}
            className="border-white/20 bg-white/5 [&_h3]:text-white [&_p]:text-white/70"
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex h-full items-center justify-center p-6">
          <EmptyState
            icon={<Clapperboard className="h-6 w-6" aria-hidden="true" />}
            title={t('reels.empty')}
            description={t('reels.emptyHint')}
            className="border-white/20 bg-white/5 text-white [&_h3]:text-white [&_p]:text-white/70"
            action={
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={buttonStyles({ variant: 'accent', size: 'md' })}
              >
                {t('reels.all')}
              </button>
            }
          />
        </div>
      ) : (
        <ReelsFeed properties={visible} agents={agentMap} initialId={startId} />
      )}
    </div>
  );
}
