import type { ReactNode } from 'react';
import { Loader2, RefreshCcw, SearchX, WifiOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-subtle', className)} aria-hidden="true" />;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Friendly empty state — never a blank screen. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-panel/60 px-6 py-16 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800/6 text-subtle dark:bg-white/8">
        {icon ?? <SearchX className="h-6 w-6" aria-hidden="true" />}
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-subtle">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/** Shared error surface with a retry affordance wired to React Query. */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/[0.04] px-6 py-14 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/12 text-red-500">
        <WifiOff className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-subtle">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={onRetry}
          leftIcon={<RefreshCcw className="h-4 w-4" aria-hidden="true" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
