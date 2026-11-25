import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BedDouble, Bath, Maximize, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Property } from '@/types';
import { ROUTES, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_LABELS_AR } from '@/utils/constants';
import { formatArea, formatNumber } from '@/utils/format';
import { useCurrency } from '@/hooks/useCurrency';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { Badge } from '@/components/common/Badge';
import { TiltCard } from '@/components/three-d';
import { Rating } from '@/components/common/Rating';
import { FavoriteButton } from './FavoriteButton';
import { CompareButton } from './CompareButton';
import { useLocalizedProperty } from '@/hooks/useLocalized';

export interface PropertyCardProps {
  property: Property;
  /** Grid cards stack vertically; list cards place media beside the copy. */
  variant?: 'grid' | 'list';
  className?: string;
  priority?: boolean;
}

/**
 * The primary listing card, used across the home page, explore results,
 * dashboard and comparison tray. Fully keyboard focusable and link-wrapped.
 */
export function PropertyCard({
  property: rawProperty,
  variant = 'grid',
  className,
  priority = false,
}: PropertyCardProps) {
  const { t, i18n } = useTranslation();
  const { priceOf, locale } = useCurrency();
  const property = useLocalizedProperty(rawProperty);

  const typeLabel =
    i18n.language === 'ar'
      ? PROPERTY_TYPE_LABELS_AR[property.type]
      : PROPERTY_TYPE_LABELS[property.type];

  const listingLabel =
    property.listingType === 'sale' ? t('explore.buy') : t('explore.rent');

  const isList = variant === 'list';
  const href = ROUTES.property(property.id);

  const specs = (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-subtle">
      <li className="inline-flex items-center gap-1.5">
        <BedDouble className="h-4 w-4 text-accent-600" aria-hidden="true" />
        {property.bedrooms} {t('details.bedrooms')}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <Bath className="h-4 w-4 text-accent-600" aria-hidden="true" />
        {property.bathrooms} {t('details.bathrooms')}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <Maximize className="h-4 w-4 text-accent-600" aria-hidden="true" />
        {formatArea(property.area, locale)}
      </li>
    </ul>
  );

  return (
    <TiltCard
      maxTilt={isList ? 2.5 : 6}
      wrapperClassName="h-full"
      className="h-full rounded-2xl"
    >
      <article
        className={cn(
          'group surface-card h-full overflow-hidden transition-[transform,box-shadow] duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift',
          isList && 'sm:flex',
          className,
        )}
      >
        <div
          className={cn(
            'relative shrink-0 overflow-hidden',
            isList ? 'sm:w-[42%] sm:max-w-xs' : '',
          )}
        >
          <Link to={href} className="block" tabIndex={-1} aria-hidden="true">
            <ImageWithFallback
              src={property.coverImage}
              alt={property.title}
              aspect={isList ? 'aspect-[4/3] sm:h-full sm:aspect-auto' : 'aspect-[4/3]'}
              priority={priority}
              className="transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
            />
          </Link>

          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex flex-col items-start gap-1.5">
              <Badge tone="brand" uppercase>
                {listingLabel}
              </Badge>
              {property.featured && (
                <Badge tone="accent" uppercase>
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {t('home.featuredTitle')}
                </Badge>
              )}
            </div>
            <div className="pointer-events-auto flex flex-col gap-2">
              <FavoriteButton propertyId={property.id} size="sm" />
              <CompareButton propertyId={property.id} size="sm" />
            </div>
          </div>
        </div>

        <div className={cn('flex flex-1 flex-col p-4 sm:p-5', isList && 'sm:justify-between')}>
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg font-semibold text-ink">
                {priceOf(property, { compact: true })}
              </p>
              <Badge tone="mist">{typeLabel}</Badge>
            </div>

            <h3 className="mt-2 line-clamp-2 text-[1.0625rem] font-semibold leading-snug text-ink">
              <Link to={href} className="link-underline">
                {property.title}
              </Link>
            </h3>

            <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-subtle">
              <MapPin className="h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
              <span className="truncate">
                {property.location.district}, {property.location.city}
              </span>
            </p>

            {isList && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-subtle">
                {property.description}
              </p>
            )}

            <div className="mt-4 border-t border-line pt-4">{specs}</div>
          </div>

          {isList && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <Rating value={property.rating} reviewsCount={property.reviewsCount} />
              <span className="text-xs font-medium text-subtle">
                {formatNumber(property.views, locale)} {t('details.views').toLowerCase()}
              </span>
            </div>
          )}
        </div>
      </article>
    </TiltCard>
  );
}
