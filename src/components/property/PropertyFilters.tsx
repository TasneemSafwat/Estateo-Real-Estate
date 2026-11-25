import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Amenity, CityInsight, ListingType, PropertyFilters, PropertyType } from '@/types';
import {
  BEDROOM_OPTIONS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_LABELS_AR,
} from '@/utils/constants';
import { parseNumericInput } from '@/utils/format';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { Select } from '@/components/common/Select';
import { DynamicIcon } from '@/components/common/Icon';

const PROPERTY_TYPE_ORDER: PropertyType[] = [
  'apartment',
  'house',
  'villa',
  'penthouse',
  'studio',
  'townhouse',
  'office',
  'land',
];

const BATHROOM_OPTIONS = BEDROOM_OPTIONS;

export interface PropertyFiltersProps {
  filters: PropertyFilters;
  onChange: (next: PropertyFilters) => void;
  cities: CityInsight[];
  amenities: Amenity[];
  className?: string;
  /** Number of amenities shown before the "show more" toggle. */
  amenityLimit?: number;
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-5 first:pt-0 last:border-b-0 last:pb-0">
      <h3 className="mb-3.5 text-[0.8125rem] font-semibold uppercase tracking-wide text-ink/70">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SegmentedFilter<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex gap-1 rounded-xl bg-brand-800/6 p-1 dark:bg-white/8">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 rounded-lg px-2 py-2 text-[0.8125rem] font-semibold transition-all duration-200',
            value === option.value ? 'bg-panel text-ink shadow-soft' : 'text-subtle hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Reusable filter panel shared by the explore sidebar and the mobile filter
 * sheet. It is fully controlled: every interaction emits a new filter object
 * with the page reset so results never land on an out-of-range page.
 */
export function PropertyFiltersPanel({
  filters,
  onChange,
  cities,
  amenities,
  className,
  amenityLimit = 8,
}: PropertyFiltersProps) {
  const { t, i18n } = useTranslation();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const idPrefix = useId();

  const isArabic = i18n.language === 'ar';
  const typeLabels = isArabic ? PROPERTY_TYPE_LABELS_AR : PROPERTY_TYPE_LABELS;
  const amenityLabel = (amenity: Amenity) => (isArabic ? amenity.labelAr : amenity.label);

  const patch = (partial: Partial<PropertyFilters>) => onChange({ ...filters, ...partial, page: 1 });

  const toggleType = (type: PropertyType) => {
    const next = filters.types.includes(type)
      ? filters.types.filter((item) => item !== type)
      : [...filters.types, type];
    patch({ types: next });
  };

  const toggleAmenity = (id: string) => {
    const next = filters.amenities.includes(id)
      ? filters.amenities.filter((item) => item !== id)
      : [...filters.amenities, id];
    patch({ amenities: next });
  };

  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, amenityLimit);

  return (
    <div className={cn('flex flex-col', className)}>
      <FilterSection title={t('explore.listingType')}>
        <SegmentedFilter
          ariaLabel={t('explore.listingType')}
          value={filters.listingType}
          onChange={(value) => patch({ listingType: value as ListingType | 'all' })}
          options={[
            { value: 'all', label: t('common.all') },
            { value: 'sale', label: t('explore.buy') },
            { value: 'rent', label: t('explore.rent') },
          ]}
        />
      </FilterSection>

      <FilterSection title={t('explore.location')}>
        <Select
          aria-label={t('explore.location')}
          value={filters.city}
          onChange={(event) => patch({ city: event.target.value })}
          options={[
            { value: 'all', label: t('common.all') },
            ...cities.map((city) => ({
              value: city.name,
              label: isArabic ? city.nameAr : city.name,
            })),
          ]}
        />
      </FilterSection>

      <FilterSection title={t('explore.propertyType')}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          {PROPERTY_TYPE_ORDER.map((type) => (
            <Checkbox
              key={type}
              id={`${idPrefix}-type-${type}`}
              checked={filters.types.includes(type)}
              onChange={() => toggleType(type)}
              label={typeLabels[type]}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title={t('explore.priceRange')}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="sr-only">{t('common.min')}</span>
            <input
              type="text"
              inputMode="numeric"
              className="field-control hide-spin-button"
              placeholder={t('common.min')}
              aria-label={`${t('explore.priceRange')} ${t('common.min')}`}
              value={filters.minPrice ?? ''}
              onChange={(event) =>
                patch({ minPrice: parseNumericInput(event.target.value) })
              }
            />
          </label>
          <label className="block">
            <span className="sr-only">{t('common.max')}</span>
            <input
              type="text"
              inputMode="numeric"
              className="field-control hide-spin-button"
              placeholder={t('common.max')}
              aria-label={`${t('explore.priceRange')} ${t('common.max')}`}
              value={filters.maxPrice ?? ''}
              onChange={(event) =>
                patch({ maxPrice: parseNumericInput(event.target.value) })
              }
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-subtle">USD</p>
      </FilterSection>

      <FilterSection title={t('explore.bedrooms')}>
        <Select
          aria-label={t('explore.bedrooms')}
          value={String(filters.bedrooms ?? '')}
          onChange={(event) =>
            patch({ bedrooms: event.target.value === '' ? null : Number(event.target.value) })
          }
          options={[
            { value: '', label: t('common.any') },
            ...BEDROOM_OPTIONS.filter((option) => option.value > 0).map((option) => ({
              value: String(option.value),
              label: option.label,
            })),
          ]}
        />
      </FilterSection>

      <FilterSection title={t('explore.bathrooms')}>
        <Select
          aria-label={t('explore.bathrooms')}
          value={String(filters.bathrooms ?? '')}
          onChange={(event) =>
            patch({ bathrooms: event.target.value === '' ? null : Number(event.target.value) })
          }
          options={[
            { value: '', label: t('common.any') },
            ...BATHROOM_OPTIONS.filter((option) => option.value > 0).map((option) => ({
              value: String(option.value),
              label: option.label,
            })),
          ]}
        />
      </FilterSection>

      <FilterSection title={t('explore.area')}>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            inputMode="numeric"
            className="field-control hide-spin-button"
            placeholder={t('explore.minArea')}
            aria-label={`${t('explore.area')} ${t('common.min')}`}
            value={filters.minArea ?? ''}
            onChange={(event) => patch({ minArea: parseNumericInput(event.target.value) })}
          />
          <input
            type="text"
            inputMode="numeric"
            className="field-control hide-spin-button"
            placeholder={t('explore.maxArea')}
            aria-label={`${t('explore.area')} ${t('common.max')}`}
            value={filters.maxArea ?? ''}
            onChange={(event) => patch({ maxArea: parseNumericInput(event.target.value) })}
          />
        </div>
      </FilterSection>

      <FilterSection title={t('explore.furnished')}>
        <SegmentedFilter
          ariaLabel={t('explore.furnished')}
          value={filters.furnished === null ? 'any' : filters.furnished ? 'yes' : 'no'}
          onChange={(value) =>
            patch({ furnished: value === 'any' ? null : value === 'yes' })
          }
          options={[
            { value: 'any', label: t('common.any') },
            { value: 'yes', label: t('common.yes') },
            { value: 'no', label: t('common.no') },
          ]}
        />
      </FilterSection>

      {amenities.length > 0 && (
        <FilterSection title={t('explore.amenities')}>
          <div className="space-y-2.5">
            {visibleAmenities.map((amenity) => (
              <Checkbox
                key={amenity.id}
                id={`${idPrefix}-amenity-${amenity.id}`}
                checked={filters.amenities.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id)}
                label={
                  <span className="inline-flex items-center gap-2">
                    <DynamicIcon name={amenity.icon} className="h-4 w-4 text-accent-600" />
                    {amenityLabel(amenity)}
                  </span>
                }
              />
            ))}
          </div>
          {amenities.length > amenityLimit && (
            <button
              type="button"
              onClick={() => setShowAllAmenities((value) => !value)}
              className="mt-3 text-[0.8125rem] font-semibold text-accent-700 hover:underline dark:text-accent-300"
            >
              {showAllAmenities ? t('common.showLess') : t('common.showMore')}
            </button>
          )}
        </FilterSection>
      )}

      <div className="pt-5">
        <Button
          variant="outline"
          fullWidth
          leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
          onClick={() =>
            onChange({
              ...filters,
              listingType: 'all',
              types: [],
              city: 'all',
              minPrice: null,
              maxPrice: null,
              bedrooms: null,
              bathrooms: null,
              minArea: null,
              maxArea: null,
              amenities: [],
              furnished: null,
              page: 1,
            })
          }
        >
          {t('common.resetFilters')}
        </Button>
      </div>
    </div>
  );
}
