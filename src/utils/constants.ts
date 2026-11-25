import type { PropertyType, SortOption } from '@/types';
import type { SelectOption } from '@/types';

export const APP = {
  name: 'Estateo',
  tagline: 'Find a home that matches your ambition.',
  description:
    'A premium real estate platform to explore, compare and shortlist exceptional properties.',
  supportEmail: 'hello@estateo.app',
  supportPhone: '+1 (415) 555-0134',
  address: '240 Sutter Street, San Francisco, CA',
  social: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'X', href: 'https://x.com' },
    { label: 'YouTube', href: 'https://youtube.com' },
  ],
} as const;

export const ROUTES = {
  home: '/',
  explore: '/properties',
  property: (id = ':id') => `/properties/${id}`,
  compare: '/compare',
  reels: '/reels',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  dashboardSaved: '/dashboard/saved',
  dashboardRecent: '/dashboard/recent',
  dashboardCompare: '/dashboard/compare',
  dashboardProfile: '/dashboard/profile',
  dashboardPreferences: '/dashboard/preferences',
  admin: '/admin',
  adminProperties: '/admin/properties',
  adminPropertyNew: '/admin/properties/new',
  adminPropertyEdit: (id = ':id') => `/admin/properties/${id}/edit`,
  adminUsers: '/admin/users',
  notFound: '*',
} as const;

export const DEFAULT_PAGE_SIZE = 9;

export const PRICE_BOUNDS = { min: 0, max: 12_000_000 };

export const PRICE_STEPS = [
  { value: 0, label: 'Any' },
  { value: 250_000, label: '250K+' },
  { value: 500_000, label: '500K+' },
  { value: 1_000_000, label: '1M+' },
  { value: 2_500_000, label: '2.5M+' },
  { value: 5_000_000, label: '5M+' },
] as const;

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartment',
  house: 'House',
  villa: 'Villa',
  penthouse: 'Penthouse',
  studio: 'Studio',
  townhouse: 'Townhouse',
  office: 'Office',
  land: 'Land',
};

export const PROPERTY_TYPE_LABELS_AR: Record<PropertyType, string> = {
  apartment: 'شقة',
  house: 'منزل',
  villa: 'فيلا',
  penthouse: 'بنتهاوس',
  studio: 'استوديو',
  townhouse: 'تاون هاوس',
  office: 'مكتب',
  land: 'أرض',
};

export const SORT_OPTIONS: SelectOption<SortOption>[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most popular' },
  { value: 'area-desc', label: 'Largest area' },
  { value: 'rating', label: 'Top rated' },
];

export const BEDROOM_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
] as const;

export const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'EGP', label: 'EGP — Egyptian Pound' },
  { value: 'EUR', label: 'EUR — Euro' },
];

export const NAV_LINKS = [
  { labelKey: 'nav.home', to: ROUTES.home },
  { labelKey: 'nav.explore', to: ROUTES.explore },
  { labelKey: 'nav.reels', to: ROUTES.reels },
  { labelKey: 'nav.compare', to: ROUTES.compare },
  { labelKey: 'nav.about', to: `${ROUTES.home}#why-estateo` },
  { labelKey: 'nav.contact', to: `${ROUTES.home}#newsletter` },
] as const;

export const COMPARISON_LIMIT = 4;
export const RECENTLY_VIEWED_LIMIT = 12;
