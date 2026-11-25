import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { readStorage, writeStorage, STORAGE_KEYS } from '@/utils/storage';

export interface FavoritesState {
  ids: string[];
}

const initialState: FavoritesState = {
  ids: readStorage<string[]>(STORAGE_KEYS.favorites, []),
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.includes(id)
        ? state.ids.filter((favoriteId) => favoriteId !== id)
        : [id, ...state.ids];
      writeStorage(STORAGE_KEYS.favorites, state.ids);
    },
    addFavorite(state, action: PayloadAction<string>) {
      if (!state.ids.includes(action.payload)) {
        state.ids = [action.payload, ...state.ids];
        writeStorage(STORAGE_KEYS.favorites, state.ids);
      }
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload);
      writeStorage(STORAGE_KEYS.favorites, state.ids);
    },
    clearFavorites(state) {
      state.ids = [];
      writeStorage(STORAGE_KEYS.favorites, state.ids);
    },
  },
});

export const { toggleFavorite, addFavorite, removeFavorite, clearFavorites } =
  favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;
