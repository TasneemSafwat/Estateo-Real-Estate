import { QueryClient } from '@tanstack/react-query';
import { ApiRequestError } from '@/services/api/client';

/**
 * Shared TanStack Query client.
 * Retries network-ish failures twice with exponential backoff but never retries
 * 4xx responses (they will not succeed on a second attempt).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiRequestError && error.status < 500) return false;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(400 * 2 ** attempt, 2_500),
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export const queryClient = createQueryClient();
