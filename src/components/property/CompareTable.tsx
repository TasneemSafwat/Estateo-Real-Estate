import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Property } from '@/types';
import { ROUTES, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_LABELS_AR } from '@/utils/constants';
import { formatArea, formatNumber } from '@/utils/format';
import { useCurrency } from '@/hooks/useCurrency';
import { IconButton } from '@/components/common/Button';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { Rating } from '@/components/common/Rating';
import { Switch } from '@/components/common/Checkbox';
import { useLocalizeProperty } from '@/hooks/useLocalized';

export interface CompareTableProps {
  properties: Property[];
  onRemove: (id: string) => void;
  className?: string;
}

interface Row {
  key: string;
  label: string;
  value: (property: Property) => React.ReactNode;
  /** Plain-text projection used to detect differences between columns. */
  compare: (property: Property) => string;
}

/**
 * Side-by-side comparison of up to four listings. Rows that differ between the
 * selected properties can be highlighted to make the trade-offs obvious.
 */
export function CompareTable({ properties: rawProperties, onRemove, className }: CompareTableProps) {
  const { t, i18n } = useTranslation();
  const localize = useLocalizeProperty();
  const properties = useMemo(() => rawProperties.map(localize), [rawProperties, localize]);
  const { priceOf, pricePerArea, locale } = useCurrency();
  const [highlight, setHighlight] = useState(true);

  const isArabic = i18n.language === 'ar';

  const rows = useMemo<Row[]>(
    () => [
      {
        key: 'price',
        label: t('admin.price'),
        value: (p) => <span className="text-base font-semibold">{priceOf(p)}</span>,
        compare: (p) => String(priceOf(p)),
      },
      {
        key: 'type',
        label: t('details.type'),
        value: (p) => (isArabic ? PROPERTY_TYPE_LABELS_AR[p.type] : PROPERTY_TYPE_LABELS[p.type]),
        compare: (p) => p.type,
      },
      {
        key: 'listing',
        label: t('explore.listingType'),
        value: (p) => (p.listingType === 'sale' ? t('explore.buy') : t('explore.rent')),
        compare: (p) => p.listingType,
      },
      {
        key: 'city',
        label: t('explore.location'),
        value: (p) => `${p.location.district}, ${p.location.city}`,
        compare: (p) => p.location.city,
      },
      {
        key: 'bedrooms',
        label: t('details.bedrooms'),
        value: (p) => formatNumber(p.bedrooms, locale),
        compare: (p) => String(p.bedrooms),
      },
      {
        key: 'bathrooms',
        label: t('details.bathrooms'),
        value: (p) => formatNumber(p.bathrooms, locale),
        compare: (p) => String(p.bathrooms),
      },
      {
        key: 'area',
        label: t('details.area'),
        value: (p) => formatArea(p.area, locale),
        compare: (p) => String(p.area),
      },
      {
        key: 'garages',
        label: t('details.garages'),
        value: (p) => formatNumber(p.garages, locale),
        compare: (p) => String(p.garages),
      },
      {
        key: 'floors',
        label: t('details.floors'),
        value: (p) => formatNumber(p.floors, locale),
        compare: (p) => String(p.floors),
      },
      {
        key: 'year',
        label: t('details.yearBuilt'),
        value: (p) => formatNumber(p.yearBuilt, locale),
        compare: (p) => String(p.yearBuilt),
      },
      {
        key: 'furnished',
        label: t('details.furnished'),
        value: (p) => (p.furnished ? t('common.yes') : t('common.no')),
        compare: (p) => String(p.furnished),
      },
      {
        key: 'pricePerArea',
        label: t('details.priceHistory'),
        value: (p) => pricePerArea(p),
        compare: (p) => String(pricePerArea(p)),
      },
      {
        key: 'amenities',
        label: t('explore.amenities'),
        value: (p) => formatNumber(p.amenities.length, locale),
        compare: (p) => String(p.amenities.length),
      },
      {
        key: 'rating',
        label: t('details.views'),
        value: (p) => <Rating value={p.rating} reviewsCount={p.reviewsCount} />,
        compare: (p) => String(p.rating),
      },
    ],
    [t, locale, isArabic, priceOf, pricePerArea],
  );

  const differing = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      const values = new Set(properties.map((property) => row.compare(property)));
      if (values.size > 1) set.add(row.key);
    });
    return set;
  }, [rows, properties]);

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Switch
          id="compare-highlight"
          checked={highlight}
          onChange={(event) => setHighlight(event.target.checked)}
          label={t('compare.highlightDifferences')}
        />
        <span className="hidden text-xs text-subtle sm:block">
          {properties.length}/4
        </span>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-line bg-panel">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <caption className="sr-only">{t('compare.title')}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky start-0 z-10 w-40 border-b border-line bg-panel p-4 text-start align-top"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  {t('compare.title')}
                </span>
              </th>
              {properties.map((property) => (
                <th
                  key={property.id}
                  scope="col"
                  className="min-w-[220px] border-b border-e border-line bg-panel p-4 align-top last:border-e-0"
                >
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <ImageWithFallback
                        src={property.coverImage}
                        alt={property.title}
                        aspect="aspect-[4/3]"
                        wrapperClassName="rounded-2xl"
                      />
                      <IconButton
                        label={t('common.remove')}
                        size="sm"
                        onClick={() => onRemove(property.id)}
                        className="absolute end-2 top-2 glass text-ink hover:bg-panel"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                    <Link
                      to={ROUTES.property(property.id)}
                      className="link-underline line-clamp-2 text-start text-sm font-semibold text-ink"
                    >
                      {property.title}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isDiff = differing.has(row.key);
              const mark = highlight && isDiff;
              return (
                <tr key={row.key} className="group">
                  <th
                    scope="row"
                    className="sticky start-0 z-10 border-b border-line bg-panel p-4 text-start text-[0.8125rem] font-medium text-subtle group-last:border-b-0"
                  >
                    <span className="inline-flex items-center gap-2">
                      {row.label}
                      {mark && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-accent-500"
                          title={t('compare.difference')}
                          aria-label={t('compare.difference')}
                        />
                      )}
                    </span>
                  </th>
                  {properties.map((property) => (
                    <td
                      key={property.id}
                      className={cn(
                        'border-b border-e border-line p-4 text-sm text-ink/85 transition-colors last:border-e-0 group-last:border-b-0',
                        mark && 'bg-accent-500/[0.07]',
                      )}
                    >
                      {row.value(property)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
