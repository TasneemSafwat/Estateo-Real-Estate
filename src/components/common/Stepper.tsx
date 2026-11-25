import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StepperProps {
  steps: { id: string; label: string }[];
  current: number;
  /** Highest step the user may jump back to. */
  furthest?: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * Horizontal progress indicator for the multi-step listing wizard.
 * Becomes a compact scrollable rail on small screens.
 */
export function Stepper({ steps, current, furthest = current, onStepClick, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const isComplete = index < current;
          const isCurrent = index === current;
          const isReachable = index <= furthest && Boolean(onStepClick);

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => isReachable && onStepClick?.(index)}
                disabled={!isReachable}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-start transition-all duration-200',
                  isCurrent
                    ? 'border-brand-800 bg-brand-800 text-white shadow-soft'
                    : isComplete
                      ? 'border-line bg-panel text-ink'
                      : 'border-line bg-panel/50 text-subtle',
                  isReachable && !isCurrent && 'hover:border-brand-800/30',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-2xs font-bold',
                    isCurrent
                      ? 'bg-white/18 text-white'
                      : isComplete
                        ? 'bg-emerald-500/16 text-emerald-600 dark:text-emerald-300'
                        : 'bg-brand-800/8 text-subtle dark:bg-white/10',
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> : index + 1}
                </span>
                <span className="hidden truncate text-[0.8125rem] font-semibold sm:block">
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'hidden h-px w-4 shrink-0 lg:block',
                    isComplete ? 'bg-brand-800/40' : 'bg-line',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
