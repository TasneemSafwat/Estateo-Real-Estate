/* Shared primitives & cross-cutting types used across the app. */

export type Theme = 'light' | 'dark';

export type Language = 'en' | 'ar';

export type Direction = 'ltr' | 'rtl';

/** Currency codes supported by the platform. */
export type CurrencyCode = 'USD' | 'AED' | 'SAR' | 'EGP' | 'EUR';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'popular'
  | 'area-desc'
  | 'rating';

/** Envelope returned by every paginated mock endpoint. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Normalised error thrown by the API service layer. */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  /** Present for validation style failures. */
  details?: Record<string, string>;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}
