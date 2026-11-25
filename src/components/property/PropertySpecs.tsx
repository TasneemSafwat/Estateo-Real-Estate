import { useTranslation } from 'react-i18next';
import {
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  Car,
  Layers,
  Maximize,
  Sofa,
  Tag,
} from 'lucide-react';
import type { Property } from '@/types';
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_LABELS_AR } from '@/utils/constants';
import { formatArea, formatNumber } from '@/utils/format';
import { useCurrency } from '@/hooks/useCurrency';
import { Badge } from '@/components/common/Badge';

const STATUS_TONE = {
  active: 'success',
  pending: 'warning',
  sold: 'danger',
  draft: 'neutral',
} as const;

/** Compact key/value specification grid for a listing. */
export function PropertySpecs({ property }: { property: Property }) {
  const { t, i18n } = useTranslation();
  const { locale, pricePerArea } = useCurrency();

  const typeLabel =
    i18n.language === 'ar'
      ? PROPERTY_TYPE_LABELS_AR[property.type]
      : PROPERTY_TYPE_LABELS[property.type];

  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    {
      icon: <Tag className="h-4 w-4" aria-hidden="true" />,
      label: t('details.type'),
      value: typeLabel,
    },
    {
      icon: <BedDouble className="h-4 w-4" aria-hidden="true" />,
      label: t('details.bedrooms'),
      value: formatNumber(property.bedrooms, locale),
    },
    {
      icon: <Bath className="h-4 w-4" aria-hidden="true" />,
      label: t('details.bathrooms'),
      value: formatNumber(property.bathrooms, locale),
    },
    {
      icon: <Maximize className="h-4 w-4" aria-hidden="true" />,
      label: t('details.area'),
      value: formatArea(property.area, locale),
    },
    {
      icon: <Car className="h-4 w-4" aria-hidden="true" />,
      label: t('details.garages'),
      value: formatNumber(property.garages, locale),
    },
    {
      icon: <Layers className="h-4 w-4" aria-hidden="true" />,
      label: t('details.floors'),
      value: formatNumber(property.floors, locale),
    },
    {
      icon: <CalendarClock className="h-4 w-4" aria-hidden="true" />,
      label: t('details.yearBuilt'),
      value: formatNumber(property.yearBuilt, locale),
    },
    {
      icon: <Sofa className="h-4 w-4" aria-hidden="true" />,
      label: t('details.furnished'),
      value: property.furnished ? t('common.yes') : t('common.no'),
    },
    {
      icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
      label: t('details.priceHistory'),
      value: pricePerArea(property),
    },
  ];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('details.specifications')}</h2>
        <Badge tone={STATUS_TONE[property.status]} uppercase>
          {property.status}
        </Badge>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-800/6 text-accent-600 dark:bg-white/8">
              {row.icon}
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-subtle">{row.label}</dt>
              <dd className="text-sm font-semibold text-ink">{row.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
