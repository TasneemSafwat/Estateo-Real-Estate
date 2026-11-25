import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { fetchCities, queryKeys } from '@/services/propertyService';
import { Container, Section, SectionHeading } from '@/components/common/Section';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { Skeleton } from '@/components/common/Skeleton';
import { TiltCard } from '@/components/three-d';
import { useCurrency } from '@/hooks/useCurrency';
import { ROUTES } from '@/utils/constants';

/** Popular-city tiles that deep-link into a city-filtered explore view. */
export function LocationsSection() {
  const { t, i18n } = useTranslation();
  const { format } = useCurrency();
  const isArabic = i18n.language === 'ar';

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.catalog.cities,
    queryFn: ({ signal }) => fetchCities(signal),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Section id="locations">
      <Container>
        <SectionHeading
          eyebrow={t('explore.location')}
          title={t('home.locationsTitle')}
          description={t('home.locationsSubtitle')}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/3] rounded-3xl" />
              ))
            : (data ?? []).slice(0, 8).map((city) => {
                const label = isArabic ? city.nameAr : city.name;
                return (
                  <TiltCard key={city.name} maxTilt={7} className="rounded-3xl">
                    <Link
                      to={`${ROUTES.explore}?city=${encodeURIComponent(city.name)}`}
                      className="group relative block overflow-hidden rounded-3xl focus-visible:outline-none"
                    >
                      <ImageWithFallback
                        src={city.image}
                        alt={label}
                        aspect="aspect-[4/3]"
                        className="transition-transform duration-700 ease-smooth group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent" />
                      <div className="absolute inset-x-4 bottom-4">
                        <p className="inline-flex items-center gap-1.5 text-base font-semibold text-white">
                          <MapPin className="h-4 w-4 text-accent-400" aria-hidden="true" />
                          {label}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-white/72">
                          <span>{city.listingsCount} {t('common.results', { count: city.listingsCount })}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {t('common.from')} {format(city.startingPrice, 'USD', { compact: true })}
                          </span>
                        </p>
                      </div>
                    </Link>
                  </TiltCard>
                );
              })}
        </div>
      </Container>
    </Section>
  );
}
