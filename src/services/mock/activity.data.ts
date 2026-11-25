import type { ActivityEntry } from '@/types';
import { buildAvatar } from '@/utils/images';

const seed: Array<Omit<ActivityEntry, 'id' | 'actorAvatar' | 'createdAt'>> = [
  { actor: 'Amira Saleh', action: 'published', target: 'Skyline Penthouse, Downtown Dubai', type: 'publish' },
  { actor: 'Marcus Bennett', action: 'updated pricing on', target: 'Sunlit 3-Bedroom House', type: 'update' },
  { actor: 'Noor Al Farsi', action: 'created', target: 'Panoramic Villa, Palm Jumeirah', type: 'create' },
  { actor: 'Daniel Okafor', action: 'archived', target: 'Boutique Studio, SoMa', type: 'delete' },
  { actor: 'Layla Haddad', action: 'signed in to', target: 'Estateo Admin', type: 'login' },
  { actor: 'Sofia Marchetti', action: 'updated gallery for', target: 'Landmark Penthouse, Tribeca', type: 'update' },
  { actor: 'Hana Kimura', action: 'published', target: 'Corner Office Space, Brickell', type: 'publish' },
  { actor: 'Priya Raman', action: 'registered for', target: 'Estateo', type: 'create' },
  { actor: 'Jonas Weber', action: 'saved', target: 'Garden-Facing Townhouse', type: 'update' },
  { actor: 'Marcus Bennett', action: 'created', target: 'Contemporary Villa, Beverly Hills', type: 'create' },
  { actor: 'Noor Al Farsi', action: 'updated status of', target: 'Serene Apartment, Al Olaya', type: 'update' },
  { actor: 'Sofia Marchetti', action: 'deleted draft', target: 'Unfinished listing #4211', type: 'delete' },
];

export const SEED_ACTIVITY: ActivityEntry[] = seed.map((entry, index) => ({
  ...entry,
  id: `activity-${index + 1}`,
  actorAvatar: buildAvatar(entry.actor, index),
  createdAt: new Date(Date.now() - (index + 1) * 5_400_000).toISOString(),
}));
