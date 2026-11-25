import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { fetchTestimonials, queryKeys } from '@/services/propertyService';
import { Container, Section, SectionHeading } from '@/components/common/Section';
import { Avatar } from '@/components/common/Avatar';
import { Rating } from '@/components/common/Rating';
import { IconButton } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/utils/cn';

/** Auto-advancing testimonials carousel with manual controls and avatar jump. */
export function TestimonialsSection() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [active, setActive] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.catalog.testimonials,
    queryFn: ({ signal }) => fetchTestimonials(signal),
    staleTime: 5 * 60 * 1000,
  });

  const testimonials = data ?? [];
  const total = testimonials.length;

  const goTo = useCallback(
    (index: number) => setActive(((index % total) + total) % total),
    [total],
  );

  useEffect(() => {
    if (total <= 1) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % total), 7000);
    return () => window.clearInterval(timer);
  }, [total]);

  const current = testimonials[active];

  return (
    <Section id="testimonials" spacing="lg">
      <Container>
        <SectionHeading
          eyebrow={t('home.statClients')}
          title={t('home.testimonialsTitle')}
          description={t('home.testimonialsSubtitle')}
          align="center"
        />

        {isLoading || !current ? (
          <Skeleton className="mx-auto h-80 max-w-3xl rounded-4xl" />
        ) : (
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-4xl border border-line bg-panel p-7 shadow-soft sm:p-10">
              <Quote
                className="absolute end-7 top-7 h-12 w-12 text-accent-500/15"
                aria-hidden="true"
              />
              <AnimatePresence mode="wait" initial={false}>
                <motion.blockquote
                  key={current.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <Rating value={current.rating} showValue={false} size="md" />
                  <p className="mt-5 text-lg leading-relaxed text-ink sm:text-xl">
                    “{isArabic ? current.quoteAr : current.quote}”
                  </p>
                  <footer className="mt-7 flex items-center gap-3.5">
                    <Avatar src={current.avatar} name={current.name} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{current.name}</p>
                      <p className="text-xs text-subtle">
                        {current.role} · {current.city}
                      </p>
                    </div>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <IconButton
                label={t('common.previous')}
                size="sm"
                variant="outline"
                onClick={() => goTo(active - 1)}
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </IconButton>

              <div className="flex items-center gap-2" role="tablist" aria-label={t('home.testimonialsTitle')}>
                {testimonials.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={index === active}
                    aria-label={`${item.name}`}
                    onClick={() => goTo(index)}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 ease-smooth',
                      index === active ? 'w-7 bg-brand-800' : 'w-2 bg-line hover:bg-subtle/60',
                    )}
                  />
                ))}
              </div>

              <IconButton
                label={t('common.next')}
                size="sm"
                variant="outline"
                onClick={() => goTo(active + 1)}
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </IconButton>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
