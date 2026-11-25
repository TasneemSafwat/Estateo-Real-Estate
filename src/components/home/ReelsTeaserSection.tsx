import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Play } from 'lucide-react';
import type { Property } from '@/types';
import { fetchReelProperties, queryKeys } from '@/services/propertyService';
import { useCurrency } from '@/hooks/useCurrency';
import { Badge } from '@/components/common/Badge';
import { buttonStyles } from '@/components/common/Button';
import { Container } from '@/components/common/Section';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { Skeleton } from '@/components/common/Skeleton';
import { TiltCard } from '@/components/three-d';
import { ROUTES } from '@/utils/constants';
import { useLocalizedProperty } from '@/hooks/useLocalized';

const CARD_COUNT = 8;

function ReelCard({ property: rawProperty }: { property: Property }) {
  const { t } = useTranslation();
  const { priceOf } = useCurrency();
  const property = useLocalizedProperty(rawProperty);
  const isSale = property.listingType === 'sale';

  return (
    <TiltCard maxTilt={8} className="rounded-3xl shadow-lift ring-1 ring-white/15">
      <Link
        to={`${ROUTES.reels}?start=${encodeURIComponent(property.id)}`}
        aria-label={`${t('reels.watchTour')}: ${property.title}`}
        className="group relative block overflow-hidden rounded-3xl focus-visible:outline-none"
      >
        <ImageWithFallback
          src={property.coverImage}
          alt=""
          className="aspect-[9/16] w-full transition-transform duration-[900ms] ease-smooth group-hover:scale-[1.06]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/10 to-brand-950/30" />

        <span className="absolute start-3 top-3">
          <Badge tone="accent">{isSale ? t('reels.buy') : t('reels.rent')}</Badge>
        </span>

        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow-lift transition-transform duration-300 group-hover:scale-110">
            <Play className="h-5 w-5 translate-x-px rtl:-translate-x-px rtl:-scale-x-100" aria-hidden="true" />
          </span>
        </span>

        <span className="absolute inset-x-0 bottom-0 p-4 text-white">
          <span className="block text-lg font-semibold leading-none">{priceOf(property)}</span>
          <span className="mt-1.5 line-clamp-1 block text-[0.8125rem] font-medium">{property.title}</span>
          <span className="mt-1 flex items-center gap-1 text-xs text-white/70">
            <MapPin className="h-3 w-3 text-accent-400" aria-hidden="true" />
            {property.location.city}
          </span>
        </span>
      </Link>
    </TiltCard>
  );
}

/**
 * Home section for the video-commerce feed: a horizontally scrolling strip of
 * vertical previews. Each card opens the reels feed on that exact listing.
 */
export function ReelsTeaserSection() {
  const { t } = useTranslation();
  const scroller = useRef<HTMLUListElement>(null);
  const { data, isPending } = useQuery({
    queryKey: queryKeys.properties.reels(12),
    queryFn: ({ signal }) => fetchReelProperties(12, signal),
  });
  const previews = (data ?? []).slice(0, CARD_COUNT);

  const scrollBy = (direction: 1 | -1) => {
    const element = scroller.current;
    if (!element) return;
    // `scrollBy` uses physical coordinates, so flip the sign in RTL.
    const rtl = getComputedStyle(element).direction === 'rtl';
    element.scrollBy({ left: direction * (rtl ? -1 : 1) * element.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-20" aria-labelledby="reels-teaser-title">
      <Container>
        <div className="relative overflow-hidden rounded-4xl bg-brand-900 py-10 sm:py-14">
          <div
            aria-hidden="true"
            className="absolute -end-24 -top-24 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -start-16 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 px-6 sm:px-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="section-eyebrow text-accent-400">{t('reels.teaserEyebrow')}</p>
              <h2
                id="reels-teaser-title"
                className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-[2rem]"
              >
                {t('reels.teaserTitle')}
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/75">
                {t('reels.teaserSubtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  aria-label={t('reels.scrollPrev')}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  aria-label={t('reels.scrollNext')}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                </button>
              </div>
              <Link to={ROUTES.reels} className={buttonStyles({ variant: 'accent', size: 'lg' })}>
                <Play className="h-4 w-4" aria-hidden="true" />
                {t('reels.teaserCta')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <ul
            ref={scroller}
            className="relative mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 pt-2 [scrollbar-width:none] sm:gap-5 sm:px-12 [&::-webkit-scrollbar]:hidden"
          >
            {isPending
              ? Array.from({ length: 5 }, (_, index) => (
                  <li key={index} className="w-[13.5rem] shrink-0 sm:w-[15rem]">
                    <Skeleton className="aspect-[9/16] w-full rounded-3xl" />
                  </li>
                ))
              : previews.map((property) => (
                  <li key={property.id} className="w-[13.5rem] shrink-0 snap-start sm:w-[15rem]">
                    <ReelCard property={property} />
                  </li>
                ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
