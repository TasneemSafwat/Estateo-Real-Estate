import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'mist' | 'success' | 'warning' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-brand-800/6 text-ink/80 dark:bg-white/10 dark:text-ink',
  brand: 'bg-brand-800 text-white dark:bg-brand-600',
  accent: 'bg-accent-400/25 text-accent-800 dark:bg-accent-400/20 dark:text-accent-300',
  mist: 'bg-mist-200/70 text-mist-800 dark:bg-mist-200/12 dark:text-mist-200',
  success: 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-500/16 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-500/14 text-red-600 dark:text-red-300',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  /**
   * Badges are typographic labels, not buttons. `uppercase` is opt-in because
   * Arabic text must never be letter-spaced or uppercased.
   */
  uppercase?: boolean;
}

export function Badge({ children, tone = 'neutral', className, uppercase = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold',
        uppercase && 'uppercase tracking-wider',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
