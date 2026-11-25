import { useTranslation } from 'react-i18next';
import { BadgeCheck, GitCompareArrows, LineChart, Users } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/common/Section';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { TiltCard } from '@/components/three-d';
import { PHOTOS } from '@/utils/images';

const PILLARS = [
  { key: 'whyVerified', icon: BadgeCheck },
  { key: 'whyCompare', icon: GitCompareArrows },
  { key: 'whyAdvisor', icon: Users },
  { key: 'whyInsight', icon: LineChart },
] as const;

/** Value proposition: a short editorial split with four supporting pillars. */
export function WhySection() {
  const { t } = useTranslation();

  return (
    <Section id="why-estateo" spacing="lg" className="bg-panel">
      <Container>
        <SectionHeading
          eyebrow={t('nav.about')}
          title={t('home.whyTitle')}
          description={t('home.whySubtitle')}
          align="center"
        />

        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <TiltCard maxTilt={5} glare={false} className="rounded-4xl">
              <ImageWithFallback
                src={PHOTOS.why}
                alt={t('home.whyTitle')}
                aspect="aspect-[4/5]"
                className="rounded-4xl"
              />
              <div style={{ transform: 'translateZ(40px)' }} className="absolute -bottom-5 end-5 rounded-3xl border border-line bg-panel/95 px-5 py-4 shadow-lift backdrop-blur sm:end-6">
                <p className="font-display text-3xl font-semibold text-ink">98%</p>
                <p className="mt-0.5 text-xs font-medium text-subtle">
                  {t('home.statClients')}
                </p>
              </div>
            </TiltCard>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {PILLARS.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="group rounded-3xl border border-line bg-canvas p-6 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-800/20 hover:shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-800/6 text-brand-700 transition-colors group-hover:bg-accent-500/16 group-hover:text-accent-700 dark:bg-white/8 dark:text-mist-100 dark:group-hover:text-accent-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{t(`home.${key}Title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-subtle">
                  {t(`home.${key}Body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
