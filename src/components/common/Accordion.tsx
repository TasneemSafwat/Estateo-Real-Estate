import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several panels to be open at once. */
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

/** Animated disclosure list used on the property details page. */
export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const baseId = useId();

  const toggle = (id: string) => {
    setOpen((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return allowMultiple ? [...current, id] : [id];
    });
  };

  return (
    <div className={cn('divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel', className)}>
      {items.map((item) => {
        const expanded = open.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={expanded}
                aria-controls={`${baseId}-panel-${item.id}`}
                id={`${baseId}-trigger-${item.id}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-brand-800/[0.03] dark:hover:bg-white/[0.04]"
              >
                <span>{item.title}</span>
                <Plus
                  className={cn(
                    'h-4 w-4 shrink-0 text-subtle transition-transform duration-300 ease-smooth',
                    expanded && 'rotate-45 text-accent-600',
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="content"
                  id={`${baseId}-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`${baseId}-trigger-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-subtle">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
