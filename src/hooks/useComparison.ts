import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addToComparison,
  clearComparison,
  removeFromComparison,
  toggleComparison,
} from '@/store/slices/comparisonSlice';

/** Comparison selection, capped at four properties, persisted locally. */
export function useComparison() {
  const ids = useAppSelector((state) => state.comparison.ids);
  const limit = useAppSelector((state) => state.comparison.limit);
  const dispatch = useAppDispatch();

  const isSelected = useCallback((id: string) => ids.includes(id), [ids]);
  const isFull = ids.length >= limit;

  const toggle = useCallback((id: string) => dispatch(toggleComparison(id)), [dispatch]);
  const add = useCallback((id: string) => dispatch(addToComparison(id)), [dispatch]);
  const remove = useCallback((id: string) => dispatch(removeFromComparison(id)), [dispatch]);
  const clear = useCallback(() => dispatch(clearComparison()), [dispatch]);

  /** Returns false when the limit prevents the addition. */
  const tryAdd = useCallback(
    (id: string) => {
      if (ids.includes(id)) return true;
      if (ids.length >= limit) return false;
      dispatch(addToComparison(id));
      return true;
    },
    [dispatch, ids, limit],
  );

  return useMemo(
    () => ({ ids, limit, count: ids.length, isFull, isSelected, toggle, add, remove, clear, tryAdd }),
    [ids, limit, isFull, isSelected, toggle, add, remove, clear, tryAdd],
  );
}
