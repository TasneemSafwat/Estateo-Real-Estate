import type { CurrencyCode, Language, Theme } from './common';

export type UserRole = 'user' | 'admin';

export interface UserPreferences {
  theme: Theme;
  language: Language;
  currency: CurrencyCode;
  emailNotifications: boolean;
  priceAlerts: boolean;
  weeklyDigest: boolean;
  /** Preferred default listing type when opening Explore. */
  defaultListingType: 'sale' | 'rent' | 'all';
  /** Preferred default search city. */
  preferredCity: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  city: string;
  bio: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface AuthSession {
  user: User;
  /** Mock JWT — clearly NOT a production credential. */
  token: string;
  expiresAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface ActivityEntry {
  id: string;
  actor: string;
  actorAvatar: string;
  action: string;
  target: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'publish';
  createdAt: string;
}
