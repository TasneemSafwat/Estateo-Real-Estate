import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { IconButton } from './Button';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-[95vw] h-[92vh]',
} as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: string;
  size?: keyof typeof SIZES;
  children: ReactNode;
  footer?: ReactNode;
  /** Hide the header entirely (used by the image lightbox). */
  bare?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog: focus trap, escape to close, scroll lock and
 * `aria-modal` semantics. Rendered through a portal so it escapes stacking contexts.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  bare = false,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useLockBodyScroll(open);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const nodes = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.offsetParent !== null);

      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    const timer = window.setTimeout(() => {
      const target = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? dialogRef.current)?.focus();
    }, 40);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [open, handleKeyDown]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-brand-950/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            {...(title ? { 'aria-labelledby': titleId } : {})}
            {...(description ? { 'aria-describedby': descriptionId } : {})}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative flex w-full flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-lift',
              SIZES[size],
              className,
            )}
          >
            {!bare && (
              <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="text-lg font-semibold leading-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={descriptionId} className="mt-1 text-sm text-subtle">
                      {description}
                    </p>
                  )}
                </div>
                <IconButton label="Close dialog" size="sm" onClick={onClose}>
                  <X className="h-[18px] w-[18px]" aria-hidden="true" />
                </IconButton>
              </header>
            )}

            <div
              className={cn(
                'min-h-0 flex-1 overflow-y-auto',
                bare ? 'p-0' : 'px-6 py-5',
              )}
            >
              {children}
            </div>

            {footer && (
              <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-canvas/60 px-6 py-4">
                {footer}
              </footer>
            )}

            {bare && (
              <IconButton
                label="Close dialog"
                size="sm"
                onClick={onClose}
                className="absolute end-3 top-3 z-10 bg-brand-950/50 text-white hover:bg-brand-950/75 hover:text-white"
              >
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              </IconButton>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
