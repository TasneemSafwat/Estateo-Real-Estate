import { describe, expect, it } from 'vitest';
import type { Property } from '@/types';
import {
  DEFAULT_PROPERTY_FILTERS,
  applyPropertyQuery,
  countActiveFilters,
  filterProperties,
  filtersToSearchParams,
  paginate,
  priceInUsd,
  searchParamsToFilters,
  sortProperties,
} from '@/services/propertyQuery';

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 'p1',
    title: 'Modern Apartment',
    description: 'Bright apartment in the city centre.',
    type: 'apartment',
    listingType: 'sale',
    status: 'active',
    price: 500_000,
    currency: 'USD',
    pricePeriod: 'total',
    area: 1200,
    bedrooms: 2,
    bathrooms: 2,
    garages: 1,
    yearBuilt: 2018,
    floors: 1,
    furnished: false,
    amenities: ['pool', 'gym'],
    location: {
      address: '1 Market Street',
      city: 'San Francisco',
      district: 'SoMa',
      country: 'United States',
      coordinates: { lat: 37.79, lng: -122.4 },
    },
    images: ['cover.jpg'],
    coverImage: 'cover.jpg',
    agentId: 'agent-1',
    featured: false,
    rating: 4.5,
    reviewsCount: 12,
    views: 100,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    ownerId: 'user-admin',
    ...overrides,
  };
}

const CATALOGUE: Property[] = [
  makeProperty({ id: 'p1' }),
  makeProperty({
    id: 'p2',
    title: 'Family House',
    type: 'house',
    price: 1_200_000,
    area: 3000,
    bedrooms: 4,
    bathrooms: 3,
    furnished: true,
    amenities: ['pool', 'garden'],
    views: 250,
    rating: 4.9,
    createdAt: '2025-06-01T00:00:00.000Z',
    location: {
      address: '9 Sunset Boulevard',
      city: 'Los Angeles',
      district: 'Beverly Hills',
      country: 'United States',
      coordinates: { lat: 34.07, lng: -118.4 },
    },
  }),
  makeProperty({
    id: 'p3',
    title: 'City Studio',
    type: 'studio',
    listingType: 'rent',
    pricePeriod: 'month',
    price: 4_000,
    area: 600,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    amenities: ['gym'],
    views: 40,
    rating: 4.1,
    createdAt: '2024-12-01T00:00:00.000Z',
    location: {
      address: '55 Broadway',
      city: 'New York',
      district: 'Tribeca',
      country: 'United States',
      coordinates: { lat: 40.71, lng: -74.0 },
    },
  }),
  makeProperty({
    id: 'p4',
    title: 'Palm Villa',
    type: 'villa',
    price: 3_670_000,
    currency: 'AED',
    area: 5000,
    bedrooms: 6,
    bathrooms: 5,
    amenities: ['pool'],
    views: 180,
    rating: 4.7,
    createdAt: '2025-03-01T00:00:00.000Z',
    location: {
      address: '1 Palm Jumeirah',
      city: 'Dubai',
      district: 'Jumeirah',
      country: 'United Arab Emirates',
      coordinates: { lat: 25.1, lng: 55.1 },
    },
  }),
];

const ids = (properties: readonly Property[]) => properties.map((property) => property.id);

describe('priceInUsd', () => {
  it('normalises foreign currencies into USD', () => {
    expect(priceInUsd(makeProperty({ price: 3_670_000, currency: 'AED' }))).toBeCloseTo(
      1_000_000,
      0,
    );
    expect(priceInUsd(makeProperty({ price: 500_000, currency: 'USD' }))).toBe(500_000);
  });
});

describe('filterProperties', () => {
  it('returns every listing for the default filter set', () => {
    expect(filterProperties(CATALOGUE, DEFAULT_PROPERTY_FILTERS)).toHaveLength(4);
  });

  it('matches a free-text search against title, type and location', () => {
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, search: 'modern' })))
      .toEqual(['p1']);
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, search: 'beverly' })))
      .toEqual(['p2']);
  });

  it('filters by listing type, property type and city', () => {
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, listingType: 'rent' })))
      .toEqual(['p3']);
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, types: ['house', 'villa'] })))
      .toEqual(['p2', 'p4']);
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, city: 'New York' })))
      .toEqual(['p3']);
  });

  it('compares prices in USD regardless of listing currency', () => {
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, minPrice: 900_000 })))
      .toEqual(['p2', 'p4']);
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, maxPrice: 600_000 })))
      .toEqual(['p1', 'p3']);
  });

  it('applies numeric thresholds and boolean flags as minimums', () => {
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, bedrooms: 4 })))
      .toEqual(['p2', 'p4']);
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, furnished: true })))
      .toEqual(['p2', 'p3']);
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, minArea: 4000 })))
      .toEqual(['p4']);
  });

  it('requires every selected amenity to be present', () => {
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, amenities: ['pool', 'gym'] })))
      .toEqual(['p1']);
    expect(ids(filterProperties(CATALOGUE, { ...DEFAULT_PROPERTY_FILTERS, amenities: ['pool'] })))
      .toEqual(['p1', 'p2', 'p4']);
  });
});

describe('sortProperties', () => {
  it('sorts by newest and oldest', () => {
    expect(ids(sortProperties(CATALOGUE, 'newest'))).toEqual(['p2', 'p4', 'p1', 'p3']);
    expect(ids(sortProperties(CATALOGUE, 'oldest'))).toEqual(['p3', 'p1', 'p4', 'p2']);
  });

  it('sorts by price ascending and descending after currency conversion', () => {
    expect(ids(sortProperties(CATALOGUE, 'price-asc'))).toEqual(['p3', 'p1', 'p4', 'p2']);
    expect(ids(sortProperties(CATALOGUE, 'price-desc'))).toEqual(['p2', 'p4', 'p1', 'p3']);
  });

  it('sorts by popularity, area and rating', () => {
    expect(ids(sortProperties(CATALOGUE, 'popular'))).toEqual(['p2', 'p4', 'p1', 'p3']);
    expect(ids(sortProperties(CATALOGUE, 'area-desc'))).toEqual(['p4', 'p2', 'p1', 'p3']);
    expect(ids(sortProperties(CATALOGUE, 'rating'))).toEqual(['p2', 'p4', 'p1', 'p3']);
  });

  it('never mutates the input array', () => {
    const original = ids(CATALOGUE);
    sortProperties(CATALOGUE, 'price-desc');
    expect(ids(CATALOGUE)).toEqual(original);
  });
});

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5];

  it('slices the requested page and reports totals', () => {
    expect(paginate(items, 1, 2)).toEqual({
      items: [1, 2],
      total: 5,
      page: 1,
      pageSize: 2,
      totalPages: 3,
    });
    expect(paginate(items, 3, 2).items).toEqual([5]);
  });

  it('clamps out-of-range pages and guards against a zero page size', () => {
    expect(paginate(items, 99, 2).page).toBe(3);
    expect(paginate(items, 0, 2).page).toBe(1);
    expect(paginate(items, 1, 0).pageSize).toBe(1);
    expect(paginate(items, 1, 0).totalPages).toBe(5);
  });

  it('always reports at least one page for an empty list', () => {
    expect(paginate([], 1, 9).totalPages).toBe(1);
  });
});

describe('applyPropertyQuery', () => {
  it('runs the full filter → sort → paginate pipeline', () => {
    const result = applyPropertyQuery(CATALOGUE, {
      ...DEFAULT_PROPERTY_FILTERS,
      listingType: 'sale',
      sort: 'price-asc',
      pageSize: 2,
      page: 1,
    });
    expect(ids(result.items)).toEqual(['p1', 'p4']);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });
});

describe('countActiveFilters', () => {
  it('counts only filters that differ from their defaults', () => {
    expect(countActiveFilters(DEFAULT_PROPERTY_FILTERS)).toBe(0);
    expect(
      countActiveFilters({
        ...DEFAULT_PROPERTY_FILTERS,
        search: 'villa',
        listingType: 'sale',
        city: 'Dubai',
        minPrice: 100,
        maxPrice: 200,
        bedrooms: 2,
        furnished: false,
        amenities: ['pool'],
      }),
    ).toBe(7);
  });
});

describe('URL <-> filter synchronisation', () => {
  it('round-trips a filter set through the query string', () => {
    const filters = {
      ...DEFAULT_PROPERTY_FILTERS,
      search: '  villa  ',
      listingType: 'rent' as const,
      types: ['villa', 'house'] as const,
      city: 'Dubai',
      minPrice: 1000,
      bedrooms: 3,
      furnished: true,
      amenities: ['pool', 'gym'],
      sort: 'price-desc' as const,
      page: 2,
    };

    const params = filtersToSearchParams({ ...filters, types: [...filters.types] });
    const restored = searchParamsToFilters(params);

    expect(restored.search).toBe('villa');
    expect(restored.listingType).toBe('rent');
    expect(restored.types).toEqual(['villa', 'house']);
    expect(restored.city).toBe('Dubai');
    expect(restored.minPrice).toBe(1000);
    expect(restored.bedrooms).toBe(3);
    expect(restored.furnished).toBe(true);
    expect(restored.amenities).toEqual(['pool', 'gym']);
    expect(restored.sort).toBe('price-desc');
    expect(restored.page).toBe(2);
  });

  it('omits default values from the query string', () => {
    const params = filtersToSearchParams(DEFAULT_PROPERTY_FILTERS);
    expect([...params.keys()]).toEqual([]);
  });
});
