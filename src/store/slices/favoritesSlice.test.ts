import { describe, expect, it } from 'vitest';
import {
  addFavorite,
  clearFavorites,
  favoritesReducer,
  removeFavorite,
  toggleFavorite,
} from '@/store/slices/favoritesSlice';

const emptyState = { ids: [] as string[] };

describe('favoritesSlice', () => {
  it('toggles an id on and off, prepending new favourites', () => {
    const added = favoritesReducer(emptyState, toggleFavorite('p1'));
    expect(added.ids).toEqual(['p1']);

    const withTwo = favoritesReducer(added, toggleFavorite('p2'));
    expect(withTwo.ids).toEqual(['p2', 'p1']);

    const removed = favoritesReducer(withTwo, toggleFavorite('p1'));
    expect(removed.ids).toEqual(['p2']);
  });

  it('addFavorite ignores duplicates', () => {
    const state = favoritesReducer(emptyState, addFavorite('p1'));
    const again = favoritesReducer(state, addFavorite('p1'));
    expect(again.ids).toEqual(['p1']);
  });

  it('removeFavorite drops a single id and leaves others intact', () => {
    const state = { ids: ['p1', 'p2', 'p3'] };
    expect(favoritesReducer(state, removeFavorite('p2')).ids).toEqual(['p1', 'p3']);
  });

  it('clearFavorites empties the list', () => {
    const state = { ids: ['p1', 'p2'] };
    expect(favoritesReducer(state, clearFavorites()).ids).toEqual([]);
  });

  it('persists the updated ids to localStorage', () => {
    favoritesReducer(emptyState, addFavorite('p9'));
    expect(window.localStorage.getItem('estateo:favorites')).toBe(JSON.stringify(['p9']));
  });
});
