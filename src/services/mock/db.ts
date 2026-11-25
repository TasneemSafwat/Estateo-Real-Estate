import type { ActivityEntry, Property, User } from '@/types';
import { readStorage, writeStorage, STORAGE_KEYS } from '@/utils/storage';
import { SEED_PROPERTIES } from './properties.data';
import { SEED_USERS } from './users.data';
import { SEED_ACTIVITY } from './activity.data';

/**
 * In-memory mock database.
 *
 * This is a FRONT-END ONLY project — there is no backend. Mutations are kept in
 * memory and mirrored into localStorage so the admin CRUD workflow survives a
 * page refresh. Nothing here talks to a real server.
 */
interface MockDatabase {
  properties: Property[];
  users: User[];
  activity: ActivityEntry[];
  version: number;
}

const DB_VERSION = 3;

interface PersistedState {
  version: number;
  properties: Property[];
}

function createDatabase(): MockDatabase {
  const persisted = readStorage<PersistedState | null>(STORAGE_KEYS.listings, null);

  const properties =
    persisted && persisted.version === DB_VERSION && Array.isArray(persisted.properties)
      ? persisted.properties
      : SEED_PROPERTIES;

  return {
    properties,
    users: SEED_USERS,
    activity: SEED_ACTIVITY,
    version: DB_VERSION,
  };
}

let db: MockDatabase = createDatabase();

function persist(): void {
  writeStorage<PersistedState>(STORAGE_KEYS.listings, {
    version: DB_VERSION,
    properties: db.properties,
  });
}

/* ---------------------------------- reads --------------------------------- */

export function getProperties(): Property[] {
  return db.properties;
}

export function getPropertyById(id: string): Property | undefined {
  return db.properties.find((property) => property.id === id);
}

export function getUsers(): User[] {
  return db.users;
}

export function getUserById(id: string): User | undefined {
  return db.users.find((user) => user.id === id);
}

export function getActivity(): ActivityEntry[] {
  return db.activity.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/* --------------------------------- writes -------------------------------- */

export function insertProperty(property: Property): Property {
  db.properties = [property, ...db.properties];
  persist();
  return property;
}

export function updatePropertyRecord(
  id: string,
  patch: Partial<Property>,
): Property | undefined {
  const index = db.properties.findIndex((property) => property.id === id);
  if (index === -1) return undefined;
  const next = { ...db.properties[index], ...patch, id };
  db.properties = db.properties.map((property, i) => (i === index ? next : property));
  persist();
  return next;
}

export function removeProperty(id: string): boolean {
  const before = db.properties.length;
  db.properties = db.properties.filter((property) => property.id !== id);
  if (db.properties.length !== before) {
    persist();
    return true;
  }
  return false;
}

export function pushActivity(
  entry: Omit<ActivityEntry, 'id' | 'createdAt'>,
): ActivityEntry {
  const record: ActivityEntry = {
    ...entry,
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  db.activity = [record, ...db.activity].slice(0, 60);
  return record;
}

export function updateUserRecord(id: string, patch: Partial<User>): User | undefined {
  const index = db.users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;
  const next = { ...db.users[index], ...patch, id };
  db.users = db.users.map((user, i) => (i === index ? next : user));
  return next;
}

export function removeUserRecord(id: string): boolean {
  const before = db.users.length;
  db.users = db.users.filter((user) => user.id !== id);
  return db.users.length !== before;
}

/** Restores the seeded catalogue — used by tests and the admin "reset demo" action. */
export function resetDatabase(): void {
  db = {
    properties: SEED_PROPERTIES,
    users: SEED_USERS,
    activity: SEED_ACTIVITY,
    version: DB_VERSION,
  };
  persist();
}

export function nextPropertyId(): string {
  const maxId = db.properties.reduce((max, property) => {
    const numeric = Number(property.id.replace(/\D/g, ''));
    return Number.isFinite(numeric) && numeric > max ? numeric : max;
  }, 0);
  return `prop-${String(maxId + 1).padStart(3, '0')}`;
}
