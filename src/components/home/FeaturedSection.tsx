import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { fetchFeaturedProperties, queryKeys } from '@/services/propertyService';
import { buttonStyles } from '@/components/common/Button';
import { Container, Section, SectionHeading } from '@/components/common/Section';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { ROUTES } from '@/utils/constants';

/** Featured listings, curated by the (mocked) editorial team. */
export function FeaturedSection() {
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.properties.featured(6),
    queryFn: ({ signal }) => fetchFeaturedProperties(6, signal),
    staleTime: 60 * 1000,
  });

  return (
    <Section id="featured" spacing="lg" className="pt-32 sm:pt-36 lg:pt-32">
      <Container>
        <SectionHeading
          eyebrow={t('home.heroBadge')}
          title={t('home.featuredTitle')}
          description={t('home.featuredSubtitle')}
          action={
            <Link
              to={ROUTES.explore}
              className={buttonStyles({ variant: 'outline', size: 'md' })}
            >
              {t('common.viewAll')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          }
        />

        <PropertyGrid
          properties={data ?? []}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          skeletonCount={6}
        />
      </Container>
    </Section>
  );
}
