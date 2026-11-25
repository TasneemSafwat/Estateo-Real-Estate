import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Renders a divider above this item. */
  dividerBefore?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  /** Extra class names for the floating menu panel. */
  menuClassName?: string;
  className?: string;
  ariaLabel?: string;
}

/** Lightweight accessible dropdown menu (click outside + escape to close). */
export function Dropdown({
  trigger,
  items,
  align = 'end',
  menuClassName,
  className,
  ariaLabel = 'Menu',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="contents"
      >
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute top-[calc(100%+0.5rem)] z-50 min-w-56 overflow-hidden rounded-2xl border border-line bg-panel p-1.5 shadow-lift',
              align === 'end' ? 'end-0' : 'start-0',
              menuClassName,
            )}
          >
            {items.map((item) => (
              <div key={item.id}>
                {item.dividerBefore && <div className="my-1.5 h-px bg-line" role="separator" />}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    setOpen(false);
                    item.onSelect();
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    item.danger
                      ? 'text-red-600 hover:bg-red-500/10 dark:text-red-400'
                      : 'text-ink/85 hover:bg-brand-800/6 hover:text-ink dark:hover:bg-white/8',
                  )}
                >
                  {item.icon && (
                    <span className="flex h-4 w-4 items-center justify-center text-subtle">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
