import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CurrencyCode, Language, Theme, UserPreferences } from '@/types';
import { DEFAULT_PREFERENCES } from '@/services/mock/users.data';
import { readStorage, writeStorage, STORAGE_KEYS } from '@/utils/storage';

export interface PreferencesState extends UserPreferences {
  /** True once preferences have been merged from the signed-in account. */
  hydrated: boolean;
}

const initialState: PreferencesState = {
  ...DEFAULT_PREFERENCES,
  ...readStorage<Partial<UserPreferences>>(STORAGE_KEYS.preferences, {}),
  hydrated: false,
};

function persist(state: PreferencesState): void {
  const { hydrated: _hydrated, ...preferences } = state;
  writeStorage(STORAGE_KEYS.preferences, preferences);
  writeStorage(STORAGE_KEYS.theme, preferences.theme);
  writeStorage(STORAGE_KEYS.language, preferences.language);
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      persist(state);
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      persist(state);
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
      persist(state);
    },
    setCurrency(state, action: PayloadAction<CurrencyCode>) {
      state.currency = action.payload;
      persist(state);
    },
    patchPreferences(state, action: PayloadAction<Partial<UserPreferences>>) {
      Object.assign(state, action.payload);
      persist(state);
    },
    /** Merge account level preferences after sign-in without clobbering local choices. */
    hydrateFromAccount(state, action: PayloadAction<Partial<UserPreferences>>) {
      Object.assign(state, action.payload);
      state.hydrated = true;
      persist(state);
    },
    resetPreferences(state) {
      const theme = state.theme;
      Object.assign(state, DEFAULT_PREFERENCES, { theme });
      persist(state);
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setLanguage,
  setCurrency,
  patchPreferences,
  hydrateFromAccount,
  resetPreferences,
} = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
