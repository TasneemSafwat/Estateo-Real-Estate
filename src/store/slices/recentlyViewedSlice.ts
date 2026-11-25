import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { RECENTLY_VIEWED_LIMIT } from '@/utils/constants';
import { readStorage, writeStorage, STORAGE_KEYS } from '@/utils/storage';

export interface RecentlyViewedState {
  ids: string[];
}

const initialState: RecentlyViewedState = {
  ids: readStorage<string[]>(STORAGE_KEYS.recentlyViewed, []),
};

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    recordView(state, action: PayloadAction<string>) {
      state.ids = [action.payload, ...state.ids.filter((id) => id !== action.payload)].slice(
        0,
        RECENTLY_VIEWED_LIMIT,
      );
      writeStorage(STORAGE_KEYS.recentlyViewed, state.ids);
    },
    clearRecentlyViewed(state) {
      state.ids = [];
      writeStorage(STORAGE_KEYS.recentlyViewed, state.ids);
    },
    removeRecentlyViewed(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload);
      writeStorage(STORAGE_KEYS.recentlyViewed, state.ids);
    },
  },
});

export const { recordView, clearRecentlyViewed, removeRecentlyViewed } =
  recentlyViewedSlice.actions;
export const recentlyViewedReducer = recentlyViewedSlice.reducer;
