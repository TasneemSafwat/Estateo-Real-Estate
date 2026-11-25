import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Amenity, CityInsight, PropertyFilters } from '@/types';
import { cn } from '@/utils/cn';
import {
  countActiveFilters,
  filtersToSearchParams,
  searchParamsToFilters,
} from '@/services/propertyQuery';
import {
  fetchAmenities,
  fetchCities,
  fetchProperties,
  queryKeys,
} from '@/services/propertyService';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button, IconButton } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Chip } from '@/components/common/Chip';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { Container, Section } from '@/components/common/Section';
import { PropertyFiltersPanel } from '@/components/property/PropertyFilters';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_LABELS_AR,
  SORT_OPTIONS,
} from '@/utils/constants';

interface ActiveChip {
  id: string;
  label: string;
  clear: () => void;
}

/** Explore results page: URL-synced filtering, sorting, views and pagination. */
export default function ExplorePage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const filtersSheet = useDisclosure();
  const resultsRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const isArabic = i18n.language === 'ar';

  useDocumentTitle({ title: t('explore.title'), description: t('explore.subtitle') });

  const filters = useMemo(() => searchParamsToFilters(searchParams), [searchParams]);

  const { data: cities } = useQuery({
    queryKey: queryKeys.catalog.cities,
    queryFn: ({ signal }) => fetchCities(signal),
    staleTime: 5 * 60 * 1000,
  });

  const { data: amenities } = useQuery({
    queryKey: queryKeys.catalog.amenities,
    queryFn: ({ signal }) => fetchAmenities(signal),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: ({ signal }) => fetchProperties(filters, signal),
    placeholderData: keepPreviousData,
  });

  /* --------------------------- URL synchronisation -------------------------- */

  const applyFilters = useCallback(
    (next: PropertyFilters, options: { replace?: boolean } = {}) => {
      setSearchParams(filtersToSearchParams(next), { replace: options.replace ?? false });
    },
    [setSearchParams],
  );

  const [searchDraft, setSearchDraft] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchDraft, 350);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch === filters.search) return;
    applyFilters({ ...filters, search: debouncedSearch, page: 1 }, { replace: true });
    // `filters` intentionally omitted — we only react to the debounced term.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  /* Scroll back to the top of the results when the page changes. */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [filters.page]);

  /* ------------------------------ active chips ------------------------------ */

  const typeLabels = isArabic ? PROPERTY_TYPE_LABELS_AR : PROPERTY_TYPE_LABELS;
  const activeCount = countActiveFilters(filters);

  const chips: ActiveChip[] = useMemo(() => {
    const output: ActiveChip[] = [];
    const patch = (partial: Partial<PropertyFilters>) =>
      applyFilters({ ...filters, ...partial, page: 1 });

    if (filters.search.trim()) {
      output.push({
        id: 'search',
        label: `“${filters.search.trim()}”`,
        clear: () => patch({ search: '' }),
      });
    }
    if (filters.listingType !== 'all') {
      output.push({
        id: 'listing',
        label: filters.listingType === 'sale' ? t('explore.buy') : t('explore.rent'),
        clear: () => patch({ listingType: 'all' }),
      });
    }
    filters.types.forEach((type) => {
      output.push({
        id: `type-${type}`,
        label: typeLabels[type],
        clear: () => patch({ types: filters.types.filter((item) => item !== type) }),
      });
    });
    if (filters.city !== 'all') {
      const match = (cities ?? []).find((city) => city.name === filters.city);
      output.push({
        id: 'city',
        label: match ? (isArabic ? match.nameAr : match.name) : filters.city,
        clear: () => patch({ city: 'all' }),
      });
    }
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      const min = filters.minPrice !== null ? `$${filters.minPrice.toLocaleString()}` : '—';
      const max = filters.maxPrice !== null ? `$${filters.maxPrice.toLocaleString()}` : '—';
      output.push({
        id: 'price',
        label: `${min} – ${max}`,
        clear: () => patch({ minPrice: null, maxPrice: null }),
      });
    }
    if (filters.bedrooms !== null) {
      output.push({
        id: 'bedrooms',
        label: `${filters.bedrooms}+ ${t('explore.bedrooms')}`,
        clear: () => patch({ bedrooms: null }),
      });
    }
    if (filters.bathrooms !== null) {
      output.push({
        id: 'bathrooms',
        label: `${filters.bathrooms}+ ${t('explore.bathrooms')}`,
        clear: () => patch({ bathrooms: null }),
      });
    }
    if (filters.minArea !== null || filters.maxArea !== null) {
      const min = filters.minArea ?? '—';
      const max = filters.maxArea ?? '—';
      output.push({
        id: 'area',
        label: `${min}–${max} sq ft`,
        clear: () => patch({ minArea: null, maxArea: null }),
      });
    }
    if (filters.furnished !== null) {
      output.push({
        id: 'furnished',
        label: filters.furnished ? t('explore.furnishedOnly') : t('explore.unfurnishedOnly'),
        clear: () => patch({ furnished: null }),
      });
    }
    filters.amenities.forEach((id) => {
      const match = (amenities ?? []).find((item: Amenity) => item.id === id);
      output.push({
        id: `amenity-${id}`,
        label: match ? (isArabic ? match.labelAr : match.label) : id,
        clear: () => patch({ amenities: filters.amenities.filter((item) => item !== id) }),
      });
    });

    return output;
  }, [filters, cities, amenities, isArabic, t, typeLabels, applyFilters]);

  const clearAll = () =>
    applyFilters({
      ...filters,
      search: '',
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
    });

  const cityOptions = cities as CityInsight[] | undefined;
  const amenityOptions = amenities as Amenity[] | undefined;

  const total = data?.total ?? 0;
  const page = data?.page ?? filters.page;
  const pageSize = data?.pageSize ?? filters.pageSize;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Section spacing="md" className="pt-28 lg:pt-32">
      <Container>
        <header className="mb-7 max-w-2xl">
          <p className="section-eyebrow">{t('nav.explore')}</p>
          <h1 className="mt-2.5 text-3xl leading-tight sm:text-[2.25rem]">{t('explore.title')}</h1>
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-subtle">
            {t('explore.subtitle')}
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[18.5rem_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="surface-card sticky top-24 max-h-[calc(100dvh-7.5rem)] overflow-y-auto p-5">
              <PropertyFiltersPanel
                filters={filters}
                onChange={applyFilters}
                cities={cityOptions ?? []}
                amenities={amenityOptions ?? []}
              />
            </div>
          </aside>

          <div className="min-w-0" ref={resultsRef}>
            <div className="surface-card mb-5 p-3 sm:p-3.5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <label htmlFor="explore-search" className="sr-only">
                    {t('common.searchPlaceholder')}
                  </label>
                  <Input
                    id="explore-search"
                    type="search"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder={t('common.searchPlaceholder')}
                    startIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                    endAdornment={
                      searchDraft ? (
                        <IconButton
                          label={t('common.reset')}
                          size="sm"
                          onClick={() => setSearchDraft('')}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      ) : undefined
                    }
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    size="md"
                    className="lg:hidden"
                    leftIcon={<SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
                    onClick={filtersSheet.open}
                  >
                    {t('common.filters')}
                    {activeCount > 0 && (
                      <span className="ms-0.5 rounded-full bg-brand-800 px-1.5 py-0.5 text-2xs font-semibold text-white">
                        {activeCount}
                      </span>
                    )}
                  </Button>

                  <div
                    role="group"
                    aria-label={`${t('common.gridView')} / ${t('common.listView')}`}
                    className="hidden rounded-full border border-line p-1 sm:flex"
                  >
                    <button
                      type="button"
                      aria-pressed={view === 'grid'}
                      aria-label={t('common.gridView')}
                      onClick={() => setView('grid')}
                      className={cn(
                        'flex h-8 w-9 items-center justify-center rounded-full transition-colors',
                        view === 'grid' ? 'bg-brand-800 text-white' : 'text-subtle hover:text-ink',
                      )}
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-pressed={view === 'list'}
                      aria-label={t('common.listView')}
                      onClick={() => setView('list')}
                      className={cn(
                        'flex h-8 w-9 items-center justify-center rounded-full transition-colors',
                        view === 'list' ? 'bg-brand-800 text-white' : 'text-subtle hover:text-ink',
                      )}
                    >
                      <List className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="min-w-[11rem]">
                    <label htmlFor="explore-sort" className="sr-only">
                      {t('common.sortBy')}
                    </label>
                    <Select
                      id="explore-sort"
                      value={filters.sort}
                      onChange={(event) =>
                        applyFilters({
                          ...filters,
                          sort: event.target.value as PropertyFilters['sort'],
                          page: 1,
                        })
                      }
                      options={SORT_OPTIONS.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {(chips.length > 0 || activeCount > 0) && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <Chip key={chip.id} label={chip.label} onRemove={chip.clear} />
                ))}
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="ms-1 text-[0.8125rem] font-semibold text-accent-700 hover:underline dark:text-accent-300"
                  >
                    {t('common.clearAll')}
                  </button>
                )}
              </div>
            )}

            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[0.8125rem] text-subtle" aria-live="polite">
                {isLoading || isFetching
                  ? t('common.loading')
                  : t('common.showing', { from, to, total })}
              </p>
              {activeCount > 0 && (
                <p className="hidden text-[0.8125rem] text-subtle lg:block">
                  {t('common.activeFilters')}: {activeCount}
                </p>
              )}
            </div>

            <PropertyGrid
              properties={data?.items ?? []}
              view={view}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => void refetch()}
              skeletonCount={filters.pageSize}
              emptyAction={
                <Button variant="outline" onClick={clearAll}>
                  {t('common.clearAll')}
                </Button>
              }
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(next) => applyFilters({ ...filters, page: next })}
              className="mt-9"
              compact
            />
          </div>
        </div>
      </Container>

      <Modal
        open={filtersSheet.isOpen}
        onClose={filtersSheet.close}
        title={t('common.filters')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={clearAll}>
              {t('common.reset')}
            </Button>
            <Button onClick={filtersSheet.close}>{t('common.apply')}</Button>
          </>
        }
      >
        <PropertyFiltersPanel
          filters={filters}
          onChange={(next) => {
            applyFilters(next);
          }}
          cities={cityOptions ?? []}
          amenities={amenityOptions ?? []}
          amenityLimit={6}
        />
      </Modal>
    </Section>
  );
}
