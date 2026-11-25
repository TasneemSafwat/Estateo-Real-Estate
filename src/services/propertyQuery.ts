import type { Paginated, Property, PropertyFilters, SortOption } from '@/types';
import { convertCurrency } from '@/utils/format';
import { searchableTranslations } from '@/utils/localize';

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters = {
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
  sort: 'newest',
  page: 1,
  pageSize: 9,
};

/** Normalise any listing price into USD so cross-currency filtering is fair. */
export function priceInUsd(property: Property): number {
  return convertCurrency(property.price, property.currency, 'USD');
}

function matchesSearch(property: Property, term: string): boolean {
  const haystack = [
    property.title,
    property.description,
    property.location.city,
    property.location.district,
    property.location.address,
    property.location.country,
    property.type,
    ...searchableTranslations(property),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(term);
}

export function filterProperties(
  properties: readonly Property[],
  filters: PropertyFilters,
): Property[] {
  const term = filters.search.trim().toLowerCase();

  return properties.filter((property) => {
    if (term && !matchesSearch(property, term)) return false;

    if (filters.listingType !== 'all' && property.listingType !== filters.listingType) {
      return false;
    }
    if (filters.types.length > 0 && !filters.types.includes(property.type)) return false;
    if (filters.city !== 'all' && property.location.city !== filters.city) return false;

    const usd = priceInUsd(property);
    if (filters.minPrice !== null && usd < filters.minPrice) return false;
    if (filters.maxPrice !== null && usd > filters.maxPrice) return false;

    if (filters.bedrooms !== null && property.bedrooms < filters.bedrooms) return false;
    if (filters.bathrooms !== null && property.bathrooms < filters.bathrooms) return false;

    if (filters.minArea !== null && property.area < filters.minArea) return false;
    if (filters.maxArea !== null && property.area > filters.maxArea) return false;

    if (filters.furnished !== null && property.furnished !== filters.furnished) return false;

    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((amenity) => property.amenities.includes(amenity))
    ) {
      return false;
    }

    return true;
  });
}

export function sortProperties(properties: readonly Property[], sort: SortOption): Property[] {
  const list = [...properties];
  switch (sort) {
    case 'oldest':
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'price-asc':
      return list.sort((a, b) => priceInUsd(a) - priceInUsd(b));
    case 'price-desc':
      return list.sort((a, b) => priceInUsd(b) - priceInUsd(a));
    case 'popular':
      return list.sort((a, b) => b.views - a.views);
    case 'area-desc':
      return list.sort((a, b) => b.area - a.area);
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    case 'newest':
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): Paginated<T> {
  const safeSize = Math.max(1, pageSize);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    total,
    page: safePage,
    pageSize: safeSize,
    totalPages,
  };
}

/** Full query pipeline: filter → sort → paginate. */
export function applyPropertyQuery(
  properties: readonly Property[],
  filters: PropertyFilters,
): Paginated<Property> {
  const filtered = filterProperties(properties, filters);
  const sorted = sortProperties(filtered, filters.sort);
  return paginate(sorted, filters.page, filters.pageSize);
}

export function countActiveFilters(filters: PropertyFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.listingType !== 'all') count += 1;
  if (filters.types.length > 0) count += 1;
  if (filters.city !== 'all') count += 1;
  if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
  if (filters.bedrooms !== null) count += 1;
  if (filters.bathrooms !== null) count += 1;
  if (filters.minArea !== null || filters.maxArea !== null) count += 1;
  if (filters.furnished !== null) count += 1;
  if (filters.amenities.length > 0) count += 1;
  return count;
}

/* --------------------------- URL <-> filter sync --------------------------- */

export function filtersToSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return;
    params.set(key, String(value));
  };

  set('q', filters.search.trim());
  if (filters.listingType !== 'all') set('listing', filters.listingType);
  if (filters.types.length > 0) set('type', filters.types.join(','));
  if (filters.city !== 'all') set('city', filters.city);
  set('minPrice', filters.minPrice);
  set('maxPrice', filters.maxPrice);
  set('beds', filters.bedrooms);
  set('baths', filters.bathrooms);
  set('minArea', filters.minArea);
  set('maxArea', filters.maxArea);
  if (filters.amenities.length > 0) set('amenities', filters.amenities.join(','));
  if (filters.furnished !== null) set('furnished', filters.furnished ? '1' : '0');
  if (filters.sort !== DEFAULT_PROPERTY_FILTERS.sort) set('sort', filters.sort);
  if (filters.page > 1) set('page', filters.page);

  return params;
}

function numberOrNull(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function searchParamsToFilters(params: URLSearchParams): PropertyFilters {
  const sort = params.get('sort') as SortOption | null;
  const listing = params.get('listing');
  const types = params.get('type');
  const amenities = params.get('amenities');
  const furnished = params.get('furnished');
  const page = numberOrNull(params.get('page'));

  return {
    ...DEFAULT_PROPERTY_FILTERS,
    search: params.get('q') ?? '',
    listingType:
      listing === 'sale' || listing === 'rent' ? listing : DEFAULT_PROPERTY_FILTERS.listingType,
    types: types ? (types.split(',').filter(Boolean) as PropertyFilters['types']) : [],
    city: params.get('city') ?? 'all',
    minPrice: numberOrNull(params.get('minPrice')),
    maxPrice: numberOrNull(params.get('maxPrice')),
    bedrooms: numberOrNull(params.get('beds')),
    bathrooms: numberOrNull(params.get('baths')),
    minArea: numberOrNull(params.get('minArea')),
    maxArea: numberOrNull(params.get('maxArea')),
    amenities: amenities ? amenities.split(',').filter(Boolean) : [],
    furnished: furnished === '1' ? true : furnished === '0' ? false : null,
    sort: sort ?? DEFAULT_PROPERTY_FILTERS.sort,
    page: page && page > 0 ? page : 1,
  };
}
