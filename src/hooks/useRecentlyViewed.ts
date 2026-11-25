import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearRecentlyViewed,
  recordView,
  removeRecentlyViewed,
} from '@/store/slices/recentlyViewedSlice';

/** Tracks the properties a user has opened, most recent first. */
export function useRecentlyViewed() {
  const ids = useAppSelector((state) => state.recentlyViewed.ids);
  const dispatch = useAppDispatch();

  const track = useCallback((id: string) => dispatch(recordView(id)), [dispatch]);
  const clear = useCallback(() => dispatch(clearRecentlyViewed()), [dispatch]);
  const remove = useCallback((id: string) => dispatch(removeRecentlyViewed(id)), [dispatch]);

  return useMemo(
    () => ({ ids, count: ids.length, track, clear, remove }),
    [ids, track, clear, remove],
  );
}

/** Records a view once when a property page mounts. */
export function useTrackPropertyView(propertyId: string | undefined): void {
  const { track } = useRecentlyViewed();

  useEffect(() => {
    if (propertyId) track(propertyId);
  }, [propertyId, track]);
}
