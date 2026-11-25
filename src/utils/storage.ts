/**
 * Namespaced, type-safe localStorage helpers.
 * All reads are defensive so a corrupted entry never crashes the app.
 */
const NAMESPACE = 'estateo';

export const STORAGE_KEYS = {
  auth: `${NAMESPACE}:auth`,
  favorites: `${NAMESPACE}:favorites`,
  comparison: `${NAMESPACE}:comparison`,
  recentlyViewed: `${NAMESPACE}:recently-viewed`,
  theme: `${NAMESPACE}:theme`,
  language: `${NAMESPACE}:language`,
  preferences: `${NAMESPACE}:preferences`,
  listings: `${NAMESPACE}:listings`,
  propertyDraft: `${NAMESPACE}:property-draft`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function isStorageAvailable(): boolean {
  try {
    const probe = `${NAMESPACE}:probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const available = typeof window !== 'undefined' && isStorageAvailable();

export function readStorage<T>(key: StorageKey, fallback: T): T {
  if (!available) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: StorageKey, value: T): void {
  if (!available) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or private mode — silently ignore */
  }
}

export function removeStorage(key: StorageKey): void {
  if (!available) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function clearStorage(): void {
  if (!available) return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  });
}
