import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('container', className)}>{children}</div>;
}

export interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  /** Vertical rhythm presets keep page spacing consistent across the app. */
  spacing?: 'sm' | 'md' | 'lg';
  as?: 'section' | 'div' | 'article';
}

const SPACING = {
  sm: 'py-10 sm:py-12',
  md: 'py-14 sm:py-20',
  lg: 'py-16 sm:py-24',
} as const;

export function Section({ children, id, className, spacing = 'md', as = 'section' }: SectionProps) {
  const Tag = as;
  return (
    <Tag id={id} className={cn('scroll-mt-24', SPACING[spacing], className)}>
      {children}
    </Tag>
  );
}

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'start' | 'center' | 'between';
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'between',
  action,
  className,
}: SectionHeadingProps) {
  const isStacked = align === 'center';

  return (
    <div
      className={cn(
        'mb-9 flex flex-col gap-4 sm:mb-11',
        align === 'between' && 'sm:flex-row sm:items-end sm:justify-between',
        isStacked && 'items-center text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', isStacked && 'mx-auto')}>
        {eyebrow && <p className="section-eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-2xl leading-tight sm:text-[2rem] lg:text-[2.25rem]">{title}</h2>
        {description && (
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-subtle sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
