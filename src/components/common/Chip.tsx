import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ChipProps {
  label: string;
  onRemove?: () => void;
  icon?: ReactNode;
  className?: string;
  tone?: 'default' | 'accent';
}

/** Active-filter chip with an accessible remove affordance. */
export function Chip({ label, onRemove, icon, className, tone = 'default' }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border py-1.5 pe-2 ps-3 text-[0.8125rem] font-medium',
        tone === 'accent'
          ? 'border-accent-500/35 bg-accent-500/12 text-accent-700 dark:text-accent-300'
          : 'border-line bg-panel text-ink/85',
        className,
      )}
    >
      {icon && <span className="flex h-3.5 w-3.5 items-center justify-center text-subtle">{icon}</span>}
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="ms-0.5 flex h-5 w-5 items-center justify-center rounded-full text-subtle transition-colors hover:bg-brand-800/10 hover:text-ink dark:hover:bg-white/12"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
