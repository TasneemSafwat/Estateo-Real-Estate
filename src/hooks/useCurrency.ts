import { useCallback, useMemo } from 'react';
import type { CurrencyCode, Property } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrency as setCurrencyAction } from '@/store/slices/preferencesSlice';
import { convertCurrency, formatPrice as formatPriceValue } from '@/utils/format';
import { LANGUAGE_META } from '@/i18n';

interface FormatOptions {
  compact?: boolean;
  period?: 'total' | 'month';
}

/**
 * Currency-aware price formatting. Listing prices are stored in their local
 * currency and converted on the fly into the user's preferred currency.
 */
export function useCurrency() {
  const currency = useAppSelector((state) => state.preferences.currency);
  const language = useAppSelector((state) => state.preferences.language);
  const dispatch = useAppDispatch();
  const locale = LANGUAGE_META[language].locale;

  const format = useCallback(
    (amount: number, from: CurrencyCode = currency, options: FormatOptions = {}) => {
      const converted = convertCurrency(amount, from, currency);
      return formatPriceValue(converted, currency, {
        compact: options.compact ?? false,
        locale,
        period: options.period ?? 'total',
      });
    },
    [currency, locale],
  );

  const priceOf = useCallback(
    (property: Property, options: FormatOptions = {}) =>
      format(property.price, property.currency, {
        period: options.period ?? (property.pricePeriod === 'month' ? 'month' : 'total'),
        ...(options.compact !== undefined ? { compact: options.compact } : {}),
      }),
    [format],
  );

  /** Price per square foot — a useful insight for comparison views. */
  const pricePerArea = useCallback(
    (property: Property) => {
      if (!property.area) return format(0, property.currency);
      return format(Math.round(property.price / property.area), property.currency);
    },
    [format],
  );

  const setCurrency = useCallback(
    (next: CurrencyCode) => dispatch(setCurrencyAction(next)),
    [dispatch],
  );

  return useMemo(
    () => ({ currency, locale, format, priceOf, pricePerArea, setCurrency }),
    [currency, locale, format, priceOf, pricePerArea, setCurrency],
  );
}
