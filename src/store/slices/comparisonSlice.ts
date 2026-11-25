import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { COMPARISON_LIMIT } from '@/utils/constants';
import { readStorage, writeStorage, STORAGE_KEYS } from '@/utils/storage';

export interface ComparisonState {
  ids: string[];
  /** Last rejected addition, surfaced as a toast/notice by the UI. */
  limit: number;
}

const initialState: ComparisonState = {
  ids: readStorage<string[]>(STORAGE_KEYS.comparison, []).slice(0, COMPARISON_LIMIT),
  limit: COMPARISON_LIMIT,
};

const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    /** Returns the next state; caps the list at COMPARISON_LIMIT. */
    toggleComparison(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.includes(id)
        ? state.ids.filter((item) => item !== id)
        : [...state.ids, id].slice(0, state.limit);
      writeStorage(STORAGE_KEYS.comparison, state.ids);
    },
    addToComparison(state, action: PayloadAction<string>) {
      if (state.ids.includes(action.payload) || state.ids.length >= state.limit) return;
      state.ids = [...state.ids, action.payload];
      writeStorage(STORAGE_KEYS.comparison, state.ids);
    },
    removeFromComparison(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload);
      writeStorage(STORAGE_KEYS.comparison, state.ids);
    },
    clearComparison(state) {
      state.ids = [];
      writeStorage(STORAGE_KEYS.comparison, state.ids);
    },
    reorderComparison(state, action: PayloadAction<string[]>) {
      state.ids = action.payload.slice(0, state.limit);
      writeStorage(STORAGE_KEYS.comparison, state.ids);
    },
  },
});

export const {
  toggleComparison,
  addToComparison,
  removeFromComparison,
  clearComparison,
  reorderComparison,
} = comparisonSlice.actions;
export const comparisonReducer = comparisonSlice.reducer;
