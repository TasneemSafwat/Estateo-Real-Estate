import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  hint?: string;
  className?: string;
}

/**
 * KPI tile used by the user and admin dashboards.
 * Trends are shown with an icon + sign so colour is never the only signal.
 */
export function StatCard({ label, value, icon, trend, trendLabel, hint, className }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-soft transition-shadow duration-300 hover:shadow-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-subtle">{label}</p>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800/6 text-brand-700 transition-colors group-hover:bg-accent-500/16 group-hover:text-accent-700 dark:bg-white/8 dark:text-mist-100 dark:group-hover:text-accent-300">
            {icon}
          </span>
        )}
      </div>

      <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {trend !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-2xs font-semibold',
              isPositive
                ? 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-500/12 text-red-600 dark:text-red-300',
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
            )}
            {isPositive ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
        )}
        {(trendLabel || hint) && <span className="text-xs text-subtle">{trendLabel ?? hint}</span>}
      </div>
    </div>
  );
}
