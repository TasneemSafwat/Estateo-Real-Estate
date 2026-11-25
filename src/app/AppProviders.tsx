import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { queryClient } from './queryClient';
import { AppEffects } from './AppEffects';

/**
 * Global providers: Redux store, TanStack Query cache and app-level effects
 * (theme/language synchronisation with the document).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppEffects />
        {children}
      </QueryClientProvider>
    </ReduxProvider>
  );
}
