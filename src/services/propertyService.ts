import type {
  AdminDashboardData,
  Agent,
  Amenity,
  CityInsight,
  Paginated,
  Property,
  PropertyCategoryStat,
  PropertyDraft,
  PropertyFilters,
} from '@/types';
import { simulateRequest, ApiRequestError } from './api/client';
import { applyPropertyQuery, priceInUsd } from './propertyQuery';
import { queryKeys } from './api/queryKeys';
import {
  getProperties,
  getPropertyById,
  insertProperty,
  nextPropertyId,
  pushActivity,
  removeProperty,
  resetDatabase,
  updatePropertyRecord,
} from './mock/db';
import { AGENTS, AGENT_MAP } from './mock/agents.data';
import { AMENITIES } from './mock/amenities.data';
import { CITIES, CATEGORY_STATS } from './mock/cities.data';
import { TESTIMONIALS, type Testimonial } from './mock/testimonials.data';

export { queryKeys };

/* -------------------------------- read APIs ------------------------------- */

export function fetchProperties(
  filters: PropertyFilters,
  signal?: AbortSignal,
): Promise<Paginated<Property>> {
  return simulateRequest(() => applyPropertyQuery(getProperties(), filters), { signal });
}

export function fetchProperty(id: string, signal?: AbortSignal): Promise<Property> {
  return simulateRequest(
    () => {
      const property = getPropertyById(id);
      if (!property) {
        throw new ApiRequestError(
          `We couldn't find a property with the id "${id}".`,
          404,
          'NOT_FOUND',
        );
      }
      return property;
    },
    { signal, minDelay: 180, maxDelay: 420 },
  );
}

export function fetchPropertiesByIds(
  ids: readonly string[],
  signal?: AbortSignal,
): Promise<Property[]> {
  return simulateRequest(
    () =>
      ids
        .map((id) => getPropertyById(id))
        .filter((property): property is Property => Boolean(property)),
    { signal, minDelay: 160, maxDelay: 380 },
  );
}

export function fetchFeaturedProperties(
  limit = 6,
  signal?: AbortSignal,
): Promise<Property[]> {
  return simulateRequest(
    () =>
      getProperties()
        .filter((property) => property.featured && property.status === 'active')
        .slice(0, limit),
    { signal, minDelay: 200, maxDelay: 520 },
  );
}

/**
 * Listings for the video-commerce feed: active properties, featured first,
 * each with enough photography to play as a tour.
 */
export function fetchReelProperties(limit = 12, signal?: AbortSignal): Promise<Property[]> {
  return simulateRequest(
    () =>
      getProperties()
        .filter((property) => property.status === 'active' && property.images.length >= 3)
        .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
        .slice(0, limit),
    { signal, minDelay: 200, maxDelay: 480 },
  );
}

export function fetchSimilarProperties(
  id: string,
  limit = 3,
  signal?: AbortSignal,
): Promise<Property[]> {
  return simulateRequest(
    () => {
      const base = getPropertyById(id);
      if (!base) return [];
      const scored = getProperties()
        .filter((property) => property.id !== id)
        .map((property) => {
          let score = 0;
          if (property.type === base.type) score += 3;
          if (property.listingType === base.listingType) score += 2;
          if (property.location.city === base.location.city) score += 3;
          if (Math.abs(property.bedrooms - base.bedrooms) <= 1) score += 1;
          return { property, score };
        })
        .sort((a, b) => b.score - a.score);
      return scored.slice(0, limit).map((entry) => entry.property);
    },
    { signal, minDelay: 260, maxDelay: 620 },
  );
}

/* ------------------------------- write APIs ------------------------------- */

function assertValidDraft(draft: PropertyDraft): void {
  const details: Record<string, string> = {};
  if (draft.title.trim().length < 8) details.title = 'Title must be at least 8 characters.';
  if (!draft.location.city) details.city = 'City is required.';
  if (draft.price <= 0) details.price = 'Price must be greater than zero.';
  if (draft.area <= 0) details.area = 'Area must be greater than zero.';
  if (Object.keys(details).length > 0) {
    throw new ApiRequestError(
      'Please correct the highlighted fields.',
      422,
      'VALIDATION_ERROR',
      details,
    );
  }
}

export function createProperty(draft: PropertyDraft): Promise<Property> {
  return simulateRequest(
    () => {
      assertValidDraft(draft);
      const now = new Date().toISOString();
      const property: Property = {
        ...draft,
        id: nextPropertyId(),
        rating: 0,
        reviewsCount: 0,
        views: 0,
        ownerId: 'user-admin',
        createdAt: now,
        updatedAt: now,
      };
      insertProperty(property);
      pushActivity({
        actor: 'Amira Saleh',
        actorAvatar: AGENTS[0].avatar,
        action: 'created',
        target: property.title,
        type: 'create',
      });
      return property;
    },
    { minDelay: 500, maxDelay: 900 },
  );
}

export function updateProperty(id: string, patch: Partial<PropertyDraft>): Promise<Property> {
  return simulateRequest(
    () => {
      const existing = getPropertyById(id);
      if (!existing) {
        throw new ApiRequestError('Property not found.', 404, 'NOT_FOUND');
      }
      const updated = updatePropertyRecord(id, {
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      if (!updated) {
        throw new ApiRequestError('Unable to update this property.', 500);
      }
      pushActivity({
        actor: 'Amira Saleh',
        actorAvatar: AGENTS[0].avatar,
        action: 'updated',
        target: updated.title,
        type: 'update',
      });
      return updated;
    },
    { minDelay: 420, maxDelay: 780 },
  );
}

export function deleteProperty(id: string): Promise<{ id: string }> {
  return simulateRequest(
    () => {
      const property = getPropertyById(id);
      if (!property) {
        throw new ApiRequestError('Property not found.', 404, 'NOT_FOUND');
      }
      const removed = removeProperty(id);
      if (!removed) {
        throw new ApiRequestError('Unable to delete this property.', 500);
      }
      pushActivity({
        actor: 'Amira Saleh',
        actorAvatar: AGENTS[0].avatar,
        action: 'deleted',
        target: property.title,
        type: 'delete',
      });
      return { id };
    },
    { minDelay: 380, maxDelay: 700 },
  );
}

export function resetPropertyCatalog(): Promise<{ ok: true }> {
  return simulateRequest(
    () => {
      resetDatabase();
      return { ok: true as const };
    },
    { minDelay: 300, maxDelay: 620 },
  );
}

export interface PropertyInquiry {
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

/** Mocked "contact the listing agent" request — resolves after a short delay. */
export function sendPropertyInquiry(payload: PropertyInquiry): Promise<{ ok: true }> {
  return simulateRequest(
    () => {
      void payload;
      return { ok: true as const };
    },
    { minDelay: 600, maxDelay: 1100 },
  );
}

/* -------------------------------- catalogue -------------------------------- */

export function fetchCities(signal?: AbortSignal): Promise<CityInsight[]> {
  return simulateRequest(() => CITIES, { signal, minDelay: 120, maxDelay: 300 });
}

export function fetchCategories(signal?: AbortSignal): Promise<PropertyCategoryStat[]> {
  return simulateRequest(() => CATEGORY_STATS, { signal, minDelay: 120, maxDelay: 300 });
}

export function fetchAmenities(signal?: AbortSignal): Promise<Amenity[]> {
  return simulateRequest(() => AMENITIES, { signal, minDelay: 100, maxDelay: 240 });
}

export function fetchAgents(signal?: AbortSignal): Promise<Agent[]> {
  return simulateRequest(() => AGENTS, { signal, minDelay: 140, maxDelay: 340 });
}

export function fetchAgent(id: string): Promise<Agent> {
  return simulateRequest(() => {
    const agent = AGENT_MAP[id];
    if (!agent) throw new ApiRequestError('Agent not found.', 404, 'NOT_FOUND');
    return agent;
  });
}

export function fetchTestimonials(signal?: AbortSignal): Promise<Testimonial[]> {
  return simulateRequest(() => TESTIMONIALS, { signal, minDelay: 120, maxDelay: 300 });
}

/* -------------------------------- analytics ------------------------------- */

function buildMonthlySeries(): AdminDashboardData['revenue'] {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months.map((month, index) => {
    const wave = Math.sin(index / 1.7) * 42_000;
    const growth = index * 9_800;
    const baseline = 168_000;
    const revenue = Math.round(baseline + growth + wave);
    return {
      month,
      revenue,
      deals: Math.round(revenue / 21_500),
    };
  });
}

export function fetchAdminDashboard(signal?: AbortSignal): Promise<AdminDashboardData> {
  return simulateRequest(
    () => {
      const properties = getProperties();
      const activeListings = properties.filter((p) => p.status === 'active').length;
      const revenue = buildMonthlySeries();
      const totalRevenue = revenue.reduce((sum, point) => sum + point.revenue, 0);
      const saleProperties = properties.filter((p) => p.listingType === 'sale');
      const averagePrice = saleProperties.length
        ? Math.round(
            saleProperties.reduce((sum, p) => sum + priceInUsd(p), 0) / saleProperties.length,
          )
        : 0;

      const distributionMap = properties.reduce<Record<string, number>>((acc, property) => {
        acc[property.location.city] = (acc[property.location.city] ?? 0) + 1;
        return acc;
      }, {});

      return {
        stats: {
          totalProperties: properties.length,
          totalUsers: 6 + Math.round(properties.length * 0.9),
          activeListings,
          totalRevenue,
          averagePrice,
          propertyTrend: 8.4,
          userTrend: 5.1,
          listingTrend: -2.3,
          revenueTrend: 12.7,
        },
        revenue,
        distribution: Object.entries(distributionMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        engagement: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
          (month, index) => ({
            month,
            views: 12_400 + index * 860 + Math.round(Math.sin(index) * 1_400),
            saved: 2_100 + index * 140 + Math.round(Math.cos(index) * 260),
            inquiries: 640 + index * 52 + Math.round(Math.sin(index / 2) * 90),
          }),
        ),
      };
    },
    { signal, minDelay: 320, maxDelay: 700 },
  );
}
