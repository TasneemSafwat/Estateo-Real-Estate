import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { authReducer } from '@/store/slices/authSlice';
import { favoritesReducer } from '@/store/slices/favoritesSlice';
import { comparisonReducer } from '@/store/slices/comparisonSlice';
import { recentlyViewedReducer } from '@/store/slices/recentlyViewedSlice';
import { preferencesReducer } from '@/store/slices/preferencesSlice';
import { toastReducer } from '@/store/slices/toastSlice';

/** Builds a fresh, isolated Redux store mirroring the app root store. */
export function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      favorites: favoritesReducer,
      comparison: comparisonReducer,
      recentlyViewed: recentlyViewedReducer,
      preferences: preferencesReducer,
      toasts: toastReducer,
    },
  });
}

export type TestStore = ReturnType<typeof createTestStore>;

/** Query client tuned for tests: no retries, no caching between cases. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  store?: TestStore;
  queryClient?: QueryClient;
}

/**
 * Renders a component inside the app's provider stack (Redux + TanStack Query
 * + Router) and returns the store/query client for assertions.
 */
export function renderWithProviders(ui: ReactElement, options: ProviderOptions = {}) {
  const {
    route = '/',
    store = createTestStore(),
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
