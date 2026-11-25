import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem<TValue extends string = string> {
  value: TValue;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps<TValue extends string = string> {
  items: TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  variant?: 'pill' | 'underline';
  className?: string;
  ariaLabel?: string;
}

/**
 * Accessible, keyboard-navigable tab list (roving tabindex + arrow keys).
 */
export function Tabs<TValue extends string = string>({
  items,
  value,
  onChange,
  variant = 'pill',
  className,
  ariaLabel = 'Tabs',
}: TabsProps<TValue>) {
  const baseId = useId();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    const currentIndex = items.findIndex((item) => item.value === value);
    let nextIndex = currentIndex;

    if (!document.documentElement.dir || document.documentElement.dir !== 'rtl') {
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + items.length) % items.length;
    } else {
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex + 1) % items.length;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex - 1 + items.length) % items.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    event.preventDefault();
    const next = items[nextIndex];
    onChange(next.value);
    document.getElementById(`${baseId}-tab-${next.value}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'no-scrollbar flex items-center gap-1.5 overflow-x-auto',
        variant === 'pill' && 'rounded-full border border-line bg-panel p-1',
        variant === 'underline' && 'border-b border-line',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            id={`${baseId}-tab-${item.value}`}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-smooth',
              variant === 'pill' && 'rounded-full',
              variant === 'underline' && '-mb-px rounded-none border-b-2 px-1 pb-3 pt-1',
              selected
                ? variant === 'pill'
                  ? 'bg-brand-800 text-white shadow-soft'
                  : 'border-brand-800 text-ink'
                : variant === 'pill'
                  ? 'text-ink/70 hover:bg-brand-800/6 hover:text-ink dark:hover:bg-white/8'
                  : 'border-transparent text-subtle hover:text-ink',
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-2xs font-semibold',
                  selected && variant === 'pill'
                    ? 'bg-white/18 text-white'
                    : 'bg-brand-800/8 text-ink/70 dark:bg-white/10',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
