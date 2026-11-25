import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addFavorite,
  clearFavorites,
  removeFavorite,
  toggleFavorite,
} from '@/store/slices/favoritesSlice';

/** Persistent favourites backed by Redux + localStorage. */
export function useFavorites() {
  const ids = useAppSelector((state) => state.favorites.ids);
  const dispatch = useAppDispatch();

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => dispatch(toggleFavorite(id)), [dispatch]);
  const add = useCallback((id: string) => dispatch(addFavorite(id)), [dispatch]);
  const remove = useCallback((id: string) => dispatch(removeFavorite(id)), [dispatch]);
  const clear = useCallback(() => dispatch(clearFavorites()), [dispatch]);

  return useMemo(
    () => ({
      ids,
      count: ids.length,
      isFavorite,
      toggle,
      add,
      remove,
      clear,
    }),
    [ids, isFavorite, toggle, add, remove, clear],
  );
}
