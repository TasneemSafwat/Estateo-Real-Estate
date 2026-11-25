import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addToast, dismissToast, clearToasts, type ToastInput } from '@/store/slices/toastSlice';
import { getErrorMessage } from '@/services/api/client';

/**
 * Thin wrapper around the toast slice so components never build payloads by hand.
 */
export function useToast() {
  const dispatch = useAppDispatch();

  const notify = useCallback((input: ToastInput) => dispatch(addToast(input)), [dispatch]);

  const success = useCallback(
    (title: string, description?: string) =>
      dispatch(addToast({ title, variant: 'success', ...(description ? { description } : {}) })),
    [dispatch],
  );

  const error = useCallback(
    (title: string, description?: string) =>
      dispatch(addToast({ title, variant: 'error', duration: 6000, ...(description ? { description } : {}) })),
    [dispatch],
  );

  const info = useCallback(
    (title: string, description?: string) =>
      dispatch(addToast({ title, variant: 'info', ...(description ? { description } : {}) })),
    [dispatch],
  );

  const warning = useCallback(
    (title: string, description?: string) =>
      dispatch(addToast({ title, variant: 'warning', ...(description ? { description } : {}) })),
    [dispatch],
  );

  /** Normalises any thrown value into an error toast. */
  const fromError = useCallback(
    (thrown: unknown, fallbackTitle = 'Something went wrong') => {
      dispatch(
        addToast({
          title: fallbackTitle,
          description: getErrorMessage(thrown),
          variant: 'error',
          duration: 6000,
        }),
      );
    },
    [dispatch],
  );

  const dismiss = useCallback((id: string) => dispatch(dismissToast(id)), [dispatch]);
  const clear = useCallback(() => dispatch(clearToasts()), [dispatch]);

  return useMemo(
    () => ({ notify, success, error, info, warning, fromError, dismiss, clear }),
    [notify, success, error, info, warning, fromError, dismiss, clear],
  );
}
