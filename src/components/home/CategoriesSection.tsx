import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { fetchCategories, queryKeys } from '@/services/propertyService';
import { Container, Section, SectionHeading } from '@/components/common/Section';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { Skeleton } from '@/components/common/Skeleton';
import { TiltCard } from '@/components/three-d';
import { ROUTES } from '@/utils/constants';

/** Browse-by-type grid; each tile deep-links into a filtered explore view. */
export function CategoriesSection() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.catalog.categories,
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Section id="categories" className="bg-panel">
      <Container>
        <SectionHeading
          eyebrow={t('explore.propertyType')}
          title={t('home.categoriesTitle')}
          description={t('home.categoriesSubtitle')}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/5] rounded-3xl" />
              ))
            : (data ?? []).map((category) => {
                const label = isArabic ? category.labelAr : category.label;
                return (
                  <TiltCard key={category.type} maxTilt={7} className="rounded-3xl">
                    <Link
                      to={`${ROUTES.explore}?type=${category.type}`}
                      className="group relative block overflow-hidden rounded-3xl focus-visible:outline-none"
                    >
                      <ImageWithFallback
                        src={category.image}
                        alt={label}
                        aspect="aspect-[4/5]"
                        className="transition-transform duration-700 ease-smooth group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/88 via-brand-950/25 to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-base font-semibold text-white">{label}</p>
                          <p className="mt-0.5 text-xs text-white/70">
                            {category.count}+ {t('common.results', { count: category.count })}
                          </p>
                        </div>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-accent-500 group-hover:text-brand-900">
                          <ArrowUpRight className="h-4 w-4 rtl:rotate-[-90deg]" aria-hidden="true" />
                        </span>
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
