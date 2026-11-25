import type { PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import { buttonStyles } from '@/components/common/Button';
import { Container } from '@/components/common/Section';
import { SearchWidget } from '@/components/property/SearchWidget';
import { Building3D } from '@/components/three-d';
import { PHOTOS } from '@/utils/images';
import { ROUTES } from '@/utils/constants';

const STATS = [
  { value: '12,400+', key: 'statListings' },
  { value: '48', key: 'statCities' },
  { value: '320+', key: 'statAdvisors' },
  { value: '9,800+', key: 'statClients' },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Landing hero: real photography, a draggable 3D city block, floating depth
 * layers that react to the pointer, the brand promise and the primary search.
 */
export function HeroSection() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 16 });
  const sy = useSpring(my, { stiffness: 70, damping: 16 });

  const photoX = useTransform(sx, (v) => v * -14);
  const photoY = useTransform(sy, (v) => v * -10);
  const chipAX = useTransform(sx, (v) => v * 36);
  const chipAY = useTransform(sy, (v) => v * 26);
  const chipBX = useTransform(sx, (v) => v * -30);
  const chipBY = useTransform(sy, (v) => v * -22);

  const handleMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      onPointerMove={handleMove}
      className="relative isolate -mt-[4.5rem] pb-16 pt-[4.5rem] lg:-mt-20 lg:pt-20"
    >
      {/* Backgrounds are clipped in their own box so the search card can overlap the next section */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-brand-950">
      {/* Layer 0: real photo with slow parallax */}
      <motion.img
        src={PHOTOS.hero}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        style={reduceMotion ? undefined : { x: photoX, y: photoY }}
        className="absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)] max-w-none object-cover"
      />
      {/* Layer 1: brand wash (reads left to right, flips in RTL) */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950/96 via-brand-900/84 to-brand-800/45 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-transparent to-brand-950/50" />
      {/* Layer 2: blueprint grid fading out */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(70%_60%_at_65%_40%,black,transparent)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      </div>

      <Container className="relative pt-14 pb-2 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur"
            >
              <BadgeCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
              {t('home.heroBadge')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: EASE }}
              className="mt-6 max-w-2xl text-[2.15rem] font-semibold leading-[1.12] text-white sm:text-5xl lg:text-[3.5rem]"
            >
              {t('home.heroTitle')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
              className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-white/80 sm:text-base"
            >
              {t('home.heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to={ROUTES.explore} className={buttonStyles({ variant: 'accent', size: 'lg' })}>
                {t('home.heroCtaPrimary')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
              <a
                href="#newsletter"
                className={buttonStyles({
                  variant: 'outline',
                  size: 'lg',
                  className: 'border-white/30 text-white hover:border-white/60 hover:bg-white/10',
                })}
              >
                {t('home.heroCtaSecondary')}
              </a>
            </motion.div>

            <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.key}>
                  <dt className="text-xs font-medium text-white/60">{t(`home.${stat.key}`)}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white sm:text-[1.65rem]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 3D scene with floating depth layers */}
          <div className="relative hidden h-[34rem] md:block lg:col-span-5">
            <Building3D className="absolute inset-0" label={t('home.heroBadge')} />

            <motion.div
              style={reduceMotion ? undefined : { x: chipAX, y: chipAY }}
              className="absolute start-0 top-6 z-10"
            >
              <div className="animate-float-y rounded-2xl border border-white/20 bg-white/12 p-3 pe-5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <img
                    src={PHOTOS.heroInterior}
                    alt=""
                    aria-hidden="true"
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold leading-none text-white">12,400+</p>
                    <p className="mt-1 text-xs text-white/70">{t('home.statListings')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={reduceMotion ? undefined : { x: chipBX, y: chipBY }}
              className="absolute bottom-24 end-0 z-10"
            >
              <div
                className="animate-float-y rounded-2xl border border-white/20 bg-white/12 p-3 pe-5 backdrop-blur-md"
                style={{ animationDelay: '-2.4s' }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400 text-brand-900">
                    <Star className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-lg font-semibold leading-none text-white">98%</p>
                    <p className="mt-1 text-xs text-white/70">{t('home.statClients')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        <div className="mt-14 -mb-28 sm:-mb-24 lg:-mb-20">
          <SearchWidget />
        </div>
      </Container>
    </section>
  );
}
