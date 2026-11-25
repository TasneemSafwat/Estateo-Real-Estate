import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ListingType, PropertyType } from '@/types';
import { ROUTES, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_LABELS_AR, PRICE_STEPS } from '@/utils/constants';
import { fetchCities, queryKeys } from '@/services/propertyService';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';

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

/**
 * Hero search widget. Collects the four highest-signal filters and hands the
 * user off to the explore page with the query encoded in the URL.
 */
export function SearchWidget({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [city, setCity] = useState('all');
  const [type, setType] = useState<PropertyType | 'all'>('all');
  const [minPrice, setMinPrice] = useState(0);

  const { data: cities } = useQuery({
    queryKey: queryKeys.catalog.cities,
    queryFn: ({ signal }) => fetchCities(signal),
    staleTime: 5 * 60 * 1000,
  });

  const isArabic = i18n.language === 'ar';
  const typeLabels = isArabic ? PROPERTY_TYPE_LABELS_AR : PROPERTY_TYPE_LABELS;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set('listing', listingType);
    if (city !== 'all') params.set('city', city);
    if (type !== 'all') params.set('type', type);
    if (minPrice > 0) params.set('minPrice', String(minPrice));
    navigate(`${ROUTES.explore}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className={cn('surface-card p-4 shadow-lift sm:p-5', className)}
      role="search"
      aria-label={t('home.searchTitle')}
    >
      <div className="mb-4 inline-flex rounded-full bg-brand-800/6 p-1 dark:bg-white/8">
        {(['sale', 'rent'] as ListingType[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setListingType(option)}
            aria-pressed={listingType === option}
            className={cn(
              'rounded-full px-4 py-2 text-[0.8125rem] font-semibold transition-all duration-200',
              listingType === option
                ? 'bg-brand-800 text-white shadow-soft'
                : 'text-subtle hover:text-ink',
            )}
          >
            {option === 'sale' ? t('home.searchTabs.buy') : t('home.searchTabs.rent')}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="search-city" className="field-label">
            {t('explore.location')}
          </label>
          <Select
            id="search-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            options={[
              { value: 'all', label: t('common.all') },
              ...(cities ?? []).map((item) => ({
                value: item.name,
                label: isArabic ? item.nameAr : item.name,
              })),
            ]}
          />
        </div>

        <div>
          <label htmlFor="search-type" className="field-label">
            {t('explore.propertyType')}
          </label>
          <Select
            id="search-type"
            value={type}
            onChange={(event) => setType(event.target.value as PropertyType | 'all')}
            options={[
              { value: 'all', label: t('common.all') },
              ...PROPERTY_TYPE_ORDER.map((value) => ({
                value,
                label: typeLabels[value],
              })),
            ]}
          />
        </div>

        <div>
          <label htmlFor="search-price" className="field-label">
            {t('explore.priceRange')}
          </label>
          <Select
            id="search-price"
            value={String(minPrice)}
            onChange={(event) => setMinPrice(Number(event.target.value))}
            options={PRICE_STEPS.map((step) => ({
              value: String(step.value),
              label: step.value === 0 ? t('common.any') : step.label,
            }))}
          />
        </div>

        <Button type="submit" size="lg" className="w-full lg:w-auto">
          <Search className="h-4 w-4" aria-hidden="true" />
          {t('common.search')}
        </Button>
      </div>
    </form>
  );
}
