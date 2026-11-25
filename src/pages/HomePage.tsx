import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  CategoriesSection,
  FeaturedSection,
  HeroSection,
  LocationsSection,
  NewsletterSection,
  ReelsTeaserSection,
  TestimonialsSection,
  WhySection,
} from '@/components/home';

/**
 * Marketing landing page. Each section is self-contained and fetches its own
 * data, so a slow query never blocks the rest of the page from rendering.
 */
export default function HomePage() {
  const { t } = useTranslation();
  useDocumentTitle({
    title: 'Estateo — Premium Real Estate Platform',
    description: t('home.heroSubtitle'),
  });

  return (
    <>
      <HeroSection />
      <FeaturedSection />
      <ReelsTeaserSection />
      <CategoriesSection />
      <LocationsSection />
      <WhySection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
