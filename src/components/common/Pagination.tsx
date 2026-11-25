import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { IconButton } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  /** Compact variant hides the page numbers on very small screens. */
  compact?: boolean;
}

/** Builds a windowed page list with ellipses, e.g. 1 … 4 5 6 … 20 */
function buildRange(page: number, totalPages: number, windowSize = 1): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);
  for (let offset = 1; offset <= windowSize; offset += 1) {
    if (page - offset > 1) pages.add(page - offset);
    if (page + offset < totalPages) pages.add(page + offset);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const output: (number | 'gap')[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) output.push('gap');
    output.push(value);
  });
  return output;
}

export function Pagination({ page, totalPages, onChange, className, compact }: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = buildRange(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <IconButton
        label="Previous page"
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </IconButton>

      <ul className={cn('items-center gap-1.5', compact ? 'hidden sm:flex' : 'flex')}>
        {range.map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-subtle">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Go to page ${item}`}
                className={cn(
                  'h-9 min-w-9 rounded-full px-2 text-[0.8125rem] font-semibold transition-colors duration-150',
                  item === page
                    ? 'bg-brand-800 text-white shadow-soft'
                    : 'text-ink/75 hover:bg-brand-800/8 hover:text-ink dark:hover:bg-white/10',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <span className="text-xs font-medium text-subtle sm:hidden">
        {page} / {totalPages}
      </span>

      <IconButton
        label="Next page"
        size="sm"
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </IconButton>
    </nav>
  );
}
