import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dismissToast, type Toast, type ToastVariant } from '@/store/slices/toastSlice';

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof Info; accent: string; ring: string }> = {
  success: { icon: CheckCircle2, accent: 'text-emerald-500', ring: 'bg-emerald-500/12' },
  error: { icon: XCircle, accent: 'text-red-500', ring: 'bg-red-500/12' },
  warning: { icon: AlertTriangle, accent: 'text-accent-600', ring: 'bg-accent-500/16' },
  info: { icon: Info, accent: 'text-brand-600 dark:text-brand-300', ring: 'bg-brand-800/10 dark:bg-white/10' },
};

function ToastCard({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();
  const { icon: Icon, accent, ring } = VARIANT_STYLES[toast.variant];

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(dismissToast(toast.id)), toast.duration);
    return () => window.clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-panel/95 p-4 shadow-lift backdrop-blur-md"
      role="status"
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', ring)}>
        <Icon className={cn('h-4 w-4', accent)} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-ink">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-subtle">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dispatch(dismissToast(toast.id))}
        aria-label="Dismiss notification"
        className="-me-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-brand-800/8 hover:text-ink dark:hover:bg-white/10"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

/** Global toast host. Mounted once in the app shell. */
export function ToastViewport() {
  const toasts = useAppSelector((state) => state.toasts.items);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <ul
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2.5 p-4 sm:items-end sm:p-5"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </ul>,
    document.body,
  );
}
