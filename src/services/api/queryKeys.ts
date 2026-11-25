import type { PropertyFilters } from '@/types';

/**
 * Single source of truth for TanStack Query cache keys.
 * Structured so list queries can be invalidated as a group after mutations.
 */
export const queryKeys = {
  properties: {
    root: ['properties'] as const,
    list: (filters: PropertyFilters) => ['properties', 'list', filters] as const,
    detail: (id: string) => ['properties', 'detail', id] as const,
    featured: (limit: number) => ['properties', 'featured', limit] as const,
    reels: (limit: number) => ['properties', 'reels', limit] as const,
    similar: (id: string, limit: number) => ['properties', 'similar', id, limit] as const,
    byIds: (ids: readonly string[]) => ['properties', 'by-ids', [...ids].sort()] as const,
  },
  catalog: {
    cities: ['catalog', 'cities'] as const,
    categories: ['catalog', 'categories'] as const,
    amenities: ['catalog', 'amenities'] as const,
    agents: ['catalog', 'agents'] as const,
    testimonials: ['catalog', 'testimonials'] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    revenue: (months: number) => ['admin', 'revenue', months] as const,
    distribution: ['admin', 'distribution'] as const,
    activity: ['admin', 'activity'] as const,
    users: ['admin', 'users'] as const,
  },
} as const;
