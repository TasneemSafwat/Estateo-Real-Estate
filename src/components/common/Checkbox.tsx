import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

/** Custom-styled checkbox that keeps the native input for accessibility. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...rest },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex cursor-pointer select-none items-start gap-2.5 text-sm text-ink',
        rest.disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[6px] border border-line bg-panel transition-colors checked:border-brand-800 checked:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-800/15"
          {...rest}
        />
        <Check
          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
      {label && <span className="leading-snug">{label}</span>}
    </label>
  );
});

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
}

/** Accessible on/off switch used across the preference panels. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, className, id, ...rest },
  ref,
) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-ink">
              {label}
            </label>
          )}
          {description && <p className="mt-0.5 text-xs text-subtle">{description}</p>}
        </div>
      )}
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input ref={ref} id={id} type="checkbox" className="peer sr-only" {...rest} />
        <span
          aria-hidden="true"
          className="h-6 w-11 rounded-full bg-line transition-colors duration-200 peer-checked:bg-brand-800 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-800/20"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute start-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-200 ease-smooth peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5"
        />
      </label>
    </div>
  );
});
