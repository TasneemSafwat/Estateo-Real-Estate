import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Agent, Property } from '@/types';
import { ReelItem } from './ReelItem';

export interface ReelsFeedProps {
  properties: Property[];
  agents: Map<string, Agent>;
  /** Property to open first (used by deep links from the home page). */
  initialId?: string;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
}

/**
 * Vertical scroll-snap feed. Tracks which reel is on screen, keeps the media of
 * neighbouring reels warm, blurs the active cover behind the frame and wires
 * keyboard navigation (arrow keys, J / K, M to mute).
 */
export function ReelsFeed({ properties, agents, initialId }: ReelsFeedProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const startConsumed = useRef(false);

  // Start from the requested reel the first time, then from the top whenever the
  // list changes (for example after filtering).
  useEffect(() => {
    const container = containerRef.current;
    const startIndex =
      !startConsumed.current && initialId
        ? properties.findIndex((property) => property.id === initialId)
        : -1;
    startConsumed.current = true;

    const target = startIndex > 0 ? startIndex : 0;
    setActive(target);
    const slide = container?.querySelector<HTMLElement>(`[data-reel-index="${target}"]`);
    if (container && slide) container.scrollTo({ top: slide.offsetTop, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const slides = Array.from(container.querySelectorAll<HTMLElement>('[data-reel-index]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.reelIndex));
          }
        });
      },
      { root: container, threshold: 0.65 },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [properties]);

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(properties.length - 1, target));
      containerRef.current
        ?.querySelector<HTMLElement>(`[data-reel-index="${clamped}"]`)
        ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    },
    [properties.length, reduceMotion],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || document.querySelector('[role="dialog"]')) return;
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 'j') {
        event.preventDefault();
        goTo(active + 1);
      } else if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'k') {
        event.preventDefault();
        goTo(active - 1);
      } else if (event.key.toLowerCase() === 'm') {
        setMuted((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, goTo]);

  const current = properties[active];

  return (
    <div className="absolute inset-0 overflow-hidden bg-brand-950">
      {/* Blurred cover of the active reel fills the sides on large screens */}
      {current && (
        <img
          key={current.id}
          src={current.coverImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full scale-125 object-cover opacity-40 blur-3xl md:block"
        />
      )}
      <div className="absolute inset-0 hidden bg-brand-950/55 md:block" />

      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((property, index) => (
          <ReelItem
            key={property.id}
            property={property}
            agent={agents.get(property.agentId)}
            index={index}
            total={properties.length}
            active={index === active}
            mounted={Math.abs(index - active) <= 1}
            muted={muted}
            onToggleMute={() => setMuted((value) => !value)}
          />
        ))}
      </div>

      {/* Previous / next, desktop */}
      <div className="absolute end-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label={t('reels.previous')}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md transition hover:bg-white/25 disabled:opacity-30"
        >
          <ChevronUp className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active >= properties.length - 1}
          aria-label={t('reels.next')}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md transition hover:bg-white/25 disabled:opacity-30"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Swipe hint, mobile, first reel only */}
      {active === 0 && properties.length > 1 && (
        <p className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex animate-float-y items-center justify-center gap-1 text-[0.6875rem] font-medium text-white/70 md:hidden">
          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          {t('reels.swipeHint')}
        </p>
      )}
    </div>
  );
}
