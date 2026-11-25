import type { CurrencyCode } from '@/types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  AED: 'AED',
  SAR: 'SAR',
  EGP: 'EGP',
  EUR: '€',
};

/** Approximate static FX table used by the front-end only mock layer. */
export const FX_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  AED: 3.67,
  SAR: 3.75,
  EGP: 49.2,
  EUR: 0.92,
};

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return amount;
  const inUsd = amount / FX_RATES[from];
  return inUsd * FX_RATES[to];
}

/**
 * Format a price with compact notation for large values.
 * `pricePeriod` appends a `/mo` suffix for rentals.
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode = 'USD',
  options: { compact?: boolean; locale?: string; period?: 'total' | 'month' } = {},
): string {
  const { compact = false, locale = 'en-US', period = 'total' } = options;
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: compact && amount >= 100_000 ? 'compact' : 'standard',
    compactDisplay: 'short',
  });
  const base = formatter.format(amount);
  return period === 'month' ? `${base}/mo` : base;
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatCompactNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatArea(area: number, locale = 'en-US'): string {
  return `${formatNumber(area, locale)} sq ft`;
}

export function formatPercent(value: number, locale = 'en-US', digits = 1): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: digits,
    signDisplay: 'exceptZero',
  }).format(value / 100);
}

export function formatDate(
  input: string | Date,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

export function formatRelativeTime(
  input: string | Date,
  locale = 'en-US',
  now: Date = new Date(),
): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  const diffSeconds = (date.getTime() - now.getTime()) / 1000;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (Math.abs(diffSeconds) >= seconds || unit === 'minute') {
      return formatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return formatter.format(Math.round(diffSeconds), 'second');
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** Locale-aware number parsing for free-text price inputs ("1,200"). */
export function parseNumericInput(value: string): number | null {
  const cleaned = value.replace(/[^\d.-]/g, '');
  if (cleaned === '' || cleaned === '-') return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
