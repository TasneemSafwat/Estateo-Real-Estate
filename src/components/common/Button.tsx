import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'subtle'
  | 'danger'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const BASE =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-smooth disabled:cursor-not-allowed disabled:opacity-55 active:translate-y-px';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-800 text-white shadow-soft hover:bg-brand-700 hover:shadow-card focus-visible:ring-4 focus-visible:ring-brand-800/20',
  accent:
    'bg-accent-500 text-brand-900 shadow-soft hover:bg-accent-400 hover:shadow-card focus-visible:ring-4 focus-visible:ring-accent-500/25',
  outline:
    'border border-line bg-transparent text-ink hover:border-brand-800/40 hover:bg-brand-800/5 dark:hover:bg-white/5 focus-visible:ring-4 focus-visible:ring-brand-800/15',
  ghost: 'bg-transparent text-ink hover:bg-brand-800/6 dark:hover:bg-white/8',
  subtle:
    'bg-brand-800/6 text-ink hover:bg-brand-800/10 dark:bg-white/8 dark:hover:bg-white/14',
  danger:
    'bg-red-600 text-white shadow-soft hover:bg-red-500 focus-visible:ring-4 focus-visible:ring-red-500/25',
  link: 'text-ink underline-offset-4 hover:underline px-0',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[0.8125rem]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-[0.9375rem]',
  icon: 'h-11 w-11',
  'icon-sm': 'h-9 w-9',
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Class name builder so links can look like buttons without extra wrappers. */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonStyleOptions {
  isLoading?: boolean;
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    className,
    isLoading = false,
    loadingLabel,
    leftIcon,
    rightIcon,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2',
          isLoading && loadingLabel && 'sr-only',
        )}
      >
        {isLoading && loadingLabel ? loadingLabel : children}
      </span>
      {!isLoading && rightIcon}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
}

/** Square icon-only button with an accessible label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', className, children, ...rest },
  ref,
) {
  const sizeClass = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-12 w-12' : 'h-11 w-11';
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={buttonStyles({ variant, className: cn('rounded-full p-0', sizeClass, className) })}
      {...rest}
    >
      {children}
    </button>
  );
});
