import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bath,
  BedDouble,
  Car,
  ChevronRight,
  Link2,
  MapPin,
  Maximize,
  Tag,
} from 'lucide-react';
import type { Amenity, Property } from '@/types';
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_LABELS_AR, ROUTES } from '@/utils/constants';
import { formatArea, formatNumber } from '@/utils/format';
import {
  fetchAgent,
  fetchAmenities,
  fetchProperty,
  queryKeys,
} from '@/services/propertyService';
import { isApiRequestError } from '@/services/api/client';
import { useCurrency } from '@/hooks/useCurrency';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useTrackPropertyView } from '@/hooks/useRecentlyViewed';
import { Button, buttonStyles } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Rating } from '@/components/common/Rating';
import { Skeleton } from '@/components/common/Skeleton';
import { ErrorState, EmptyState } from '@/components/common/Feedback';
import { Container, Section } from '@/components/common/Section';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertySpecs } from '@/components/property/PropertySpecs';
import { PropertyMap } from '@/components/property/PropertyMap';
import { AmenityList } from '@/components/property/AmenityList';
import { AgentCard } from '@/components/property/AgentCard';
import { ContactAgentForm } from '@/components/property/ContactAgentForm';
import { SimilarProperties } from '@/components/property/SimilarProperties';
import { FavoriteButton } from '@/components/property/FavoriteButton';
import { CompareButton } from '@/components/property/CompareButton';
import { useLocalizeProperty, useLocalizedAgent } from '@/hooks/useLocalized';

function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="aspect-[16/9] rounded-4xl" />
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  );
}

function FactTile({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-panel px-3.5 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800/6 text-accent-600 dark:bg-white/8">
        {icon}
      </span>
      <span className="text-[0.8125rem] font-semibold text-ink">{label}</span>
    </div>
  );
}

function PricePanel({ property }: { property: Property }) {
  const { t } = useTranslation();
  const { priceOf, pricePerArea } = useCurrency();
  const toast = useToast();
  const { copied, copy } = useCopyToClipboard();

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    if (await copy(url)) toast.success(t('common.linkCopied'));
  };

  return (
    <div className="surface-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-ink">
            {priceOf(property, { period: property.pricePeriod })}
          </p>
          <p className="mt-1 text-xs text-subtle">
            {t('details.priceHistory')}: {pricePerArea(property)}
          </p>
        </div>
        <Badge tone={property.listingType === 'sale' ? 'brand' : 'accent'} uppercase>
          {property.listingType === 'sale' ? t('explore.buy') : t('explore.rent')}
        </Badge>
      </div>

      <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-subtle">{t('details.propertyId')}</dt>
          <dd className="font-semibold text-ink">{property.id}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-subtle">{t('details.views')}</dt>
          <dd className="font-semibold text-ink">{formatNumber(property.views)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <FavoriteButton propertyId={property.id} variant="inline" className="h-11 w-11" />
        <CompareButton propertyId={property.id} variant="inline" showLabel className="h-11" />
        <Button
          variant="outline"
          size="md"
          className="h-11"
          onClick={() => void share()}
          leftIcon={<Link2 className="h-4 w-4" aria-hidden="true" />}
        >
          {copied ? t('common.linkCopied') : t('common.share')}
        </Button>
      </div>
    </div>
  );
}

/** Full listing page: gallery, detail sections, agent sidebar and similar homes. */
export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  useTrackPropertyView(id);

  const propertyQuery = useQuery({
    queryKey: queryKeys.properties.detail(id ?? ''),
    queryFn: ({ signal }) => fetchProperty(id as string, signal),
    enabled: Boolean(id),
    retry: (count, error) => !(isApiRequestError(error) && error.status === 404) && count < 2,
  });

  const localize = useLocalizeProperty();
  const rawProperty = propertyQuery.data;
  const property = useMemo(
    () => (rawProperty ? localize(rawProperty) : undefined),
    [rawProperty, localize],
  );

  const amenitiesQuery = useQuery({
    queryKey: queryKeys.catalog.amenities,
    queryFn: ({ signal }) => fetchAmenities(signal),
    staleTime: 5 * 60 * 1000,
  });

  const agentQuery = useQuery({
    queryKey: [...queryKeys.catalog.agents, property?.agentId],
    queryFn: () => fetchAgent(property?.agentId as string),
    enabled: Boolean(property?.agentId),
  });

  const localizedAgent = useLocalizedAgent(agentQuery.data);

  useDocumentTitle({
    title: property ? `${property.title} — ${property.location.city}` : t('details.notFoundTitle'),
    description: property?.description,
    image: property?.coverImage,
  });

  if (propertyQuery.isLoading) {
    return (
      <Section spacing="md" className="pt-28 lg:pt-32">
        <Container>
          <DetailSkeleton />
        </Container>
      </Section>
    );
  }

  const notFound =
    !property &&
    (!propertyQuery.error || (isApiRequestError(propertyQuery.error) && propertyQuery.error.status === 404));

  if (notFound && !propertyQuery.isError) {
    return (
      <Section spacing="md" className="pt-28 lg:pt-32">
        <Container>
          <EmptyState
            title={t('details.notFoundTitle')}
            description={t('details.notFoundBody')}
            action={
              <Link to={ROUTES.explore} className={buttonStyles({ variant: 'primary' })}>
                {t('explore.title')}
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  if (!property) {
    return (
      <Section spacing="md" className="pt-28 lg:pt-32">
        <Container>
          <ErrorState
            onRetry={() => void propertyQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        </Container>
      </Section>
    );
  }

  const amenityCatalogue = amenitiesQuery.data ?? [];
  const propertyAmenities: Amenity[] = amenityCatalogue.filter((amenity) =>
    property.amenities.includes(amenity.id),
  );

  const facts = [
    {
      icon: <BedDouble className="h-4 w-4" aria-hidden="true" />,
      label: `${property.bedrooms} ${t('details.bedrooms')}`,
    },
    {
      icon: <Bath className="h-4 w-4" aria-hidden="true" />,
      label: `${property.bathrooms} ${t('details.bathrooms')}`,
    },
    {
      icon: <Maximize className="h-4 w-4" aria-hidden="true" />,
      label: formatArea(property.area),
    },
    {
      icon: <Car className="h-4 w-4" aria-hidden="true" />,
      label: `${property.garages} ${t('details.garages')}`,
    },
  ];

  return (
    <Section spacing="md" className="pt-28 lg:pt-32">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-subtle">
            <li>
              <Link to={ROUTES.home} className="hover:text-ink">
                {t('nav.home')}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            <li>
              <Link to={ROUTES.explore} className="hover:text-ink">
                {t('nav.explore')}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            <li className="truncate font-medium text-ink" aria-current="page">
              {property.title}
            </li>
          </ol>
        </nav>

        <PropertyGallery images={property.images} title={property.title} />

        <div className="mt-10 lg:grid lg:grid-cols-[1fr_22rem] lg:gap-10 xl:gap-14">
          <div className="min-w-0 space-y-10">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="mist" uppercase>
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  {isArabic
                    ? PROPERTY_TYPE_LABELS_AR[property.type]
                    : PROPERTY_TYPE_LABELS[property.type]}
                </Badge>
                {property.featured && <Badge tone="accent" uppercase>{t('home.featuredTitle')}</Badge>}
                {property.furnished && <Badge tone="neutral">{t('explore.furnishedOnly')}</Badge>}
              </div>

              <h1 className="mt-4 text-2xl leading-tight sm:text-[2rem]">{property.title}</h1>

              <p className="mt-3 flex items-center gap-2 text-[0.9375rem] text-subtle">
                <MapPin className="h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                {property.location.address}, {property.location.district},{' '}
                {property.location.city}, {property.location.country}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Rating value={property.rating} reviewsCount={property.reviewsCount} size="md" />
                <span className="text-[0.8125rem] text-subtle">
                  {formatNumber(property.views)} {t('details.views').toLowerCase()}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {facts.map((fact) => (
                  <FactTile key={fact.label} icon={fact.icon} label={fact.label} />
                ))}
              </div>
            </header>

            <section>
              <h2 className="text-lg font-semibold">{t('details.description')}</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-subtle">
                {property.description}
              </p>
            </section>

            <section>
              <h2 className="mb-5 text-lg font-semibold">{t('details.amenities')}</h2>
              {amenitiesQuery.isLoading ? (
                <Skeleton className="h-24 w-full rounded-2xl" />
              ) : (
                <AmenityList amenities={propertyAmenities} />
              )}
            </section>

            <section className="surface-card p-6">
              <PropertySpecs property={property} />
            </section>

            <section>
              <h2 className="mb-5 text-lg font-semibold">{t('details.locationSection')}</h2>
              <PropertyMap location={property.location} title={property.title} />
            </section>
          </div>

          <aside className="mt-10 lg:mt-0">
            <div className="space-y-5 lg:sticky lg:top-24">
              <PricePanel property={property} />
              {agentQuery.data && <AgentCard agent={agentQuery.data} />}
              <ContactAgentForm
                propertyId={property.id}
                {...(localizedAgent ? { agentName: localizedAgent.name } : {})}
              />
            </div>
          </aside>
        </div>

        <div className="mt-16">
          <SimilarProperties propertyId={property.id} />
        </div>
      </Container>
    </Section>
  );
}
