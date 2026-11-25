import { cn } from '@/utils/cn';

export interface LogoProps {
  className?: string;
  /** Use light text (for dark/transparent headers). */
  inverted?: boolean;
  showWordmark?: boolean;
}

/**
 * Estateo wordmark: an original geometric monogram (roofline + stacked floors)
 * drawn as inline SVG so it stays crisp at any size and needs no asset request.
 */
export function Logo({ className, inverted = false, showWordmark = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-9 w-9 shrink-0"
        role="img"
        aria-label="Estateo"
      >
        <rect width="40" height="40" rx="11" fill={inverted ? '#E1E8E8' : '#153A41'} />
        {/* Roofline */}
        <path
          d="M10 19.4 20 11.5l10 7.9"
          fill="none"
          stroke="#E89F12"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stacked floors forming an abstract E */}
        <path
          d="M13.4 22.6h13.2M13.4 26.4h9.2M13.4 30.2h13.2"
          stroke={inverted ? '#153A41' : '#F6F9F9'}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span
          className={cn(
            'font-display text-[1.3rem] font-semibold leading-none',
            inverted ? 'text-white' : 'text-ink',
          )}
        >
          Estateo
        </span>
      )}
    </span>
  );
}
