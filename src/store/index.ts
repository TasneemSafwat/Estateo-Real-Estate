import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { favoritesReducer } from './slices/favoritesSlice';
import { comparisonReducer } from './slices/comparisonSlice';
import { recentlyViewedReducer } from './slices/recentlyViewedSlice';
import { preferencesReducer } from './slices/preferencesSlice';
import { toastReducer } from './slices/toastSlice';

/**
 * Root store. Persistence is handled per-slice inside each reducer so the store
 * stays free of side-effect middleware and remains trivial to test.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    favorites: favoritesReducer,
    comparison: comparisonReducer,
    recentlyViewed: recentlyViewedReducer,
    preferences: preferencesReducer,
    toasts: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // auth session only contains plain serialisable values, so keep defaults
        ignoredActionPaths: [],
      },
    }),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
