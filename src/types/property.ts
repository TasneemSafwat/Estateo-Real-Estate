import type { CurrencyCode, SortOption } from './common';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'villa'
  | 'penthouse'
  | 'studio'
  | 'townhouse'
  | 'office'
  | 'land';

export type ListingType = 'sale' | 'rent';

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'draft';

export type AmenityCategory = 'interior' | 'exterior' | 'building' | 'utilities';

export interface Amenity {
  id: string;
  label: string;
  labelAr: string;
  category: AmenityCategory;
  /** Lucide icon name resolved through the icon registry. */
  icon: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PropertyLocation {
  address: string;
  city: string;
  district: string;
  country: string;
  coordinates: GeoPoint;
}

/** Pre-translated listing copy. `source` records the English text it was written for. */
export interface PropertyTranslation {
  title: string;
  description: string;
  source: { title: string; description: string };
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  phone: string;
  email: string;
  rating: number;
  listingsCount: number;
  bio: string;
  languages: string[];
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  currency: CurrencyCode;
  /** Rent listings are priced per month, sale listings as a lump sum. */
  pricePeriod: 'total' | 'month';
  area: number;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  yearBuilt: number;
  floors: number;
  furnished: boolean;
  amenities: string[];
  location: PropertyLocation;
  images: string[];
  coverImage: string;
  agentId: string;
  featured: boolean;
  rating: number;
  reviewsCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  /** Optional hand-written translations keyed by language code. */
  translations?: { ar?: PropertyTranslation };
}

/** Query contract accepted by the property service. */
export interface PropertyFilters {
  search: string;
  listingType: ListingType | 'all';
  types: PropertyType[];
  city: string | 'all';
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  minArea: number | null;
  maxArea: number | null;
  amenities: string[];
  furnished: boolean | null;
  sort: SortOption;
  page: number;
  pageSize: number;
}

export type PropertyDraft = Omit<
  Property,
  'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewsCount' | 'views' | 'ownerId'
>;

export interface CityInsight {
  name: string;
  nameAr: string;
  country: string;
  listingsCount: number;
  image: string;
  startingPrice: number;
  coordinates: GeoPoint;
}

export interface PropertyCategoryStat {
  type: PropertyType;
  label: string;
  labelAr: string;
  count: number;
  image: string;
}
