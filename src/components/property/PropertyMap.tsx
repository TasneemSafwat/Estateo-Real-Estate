import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PropertyLocation } from '@/types';

export interface PropertyMapProps {
  location: PropertyLocation;
  title: string;
  className?: string;
  height?: string;
}

/**
 * Location map for a listing. Renders a real OpenStreetMap embed (no API key
 * required) centred on the property with an always-available "open in maps"
 * link so the feature degrades gracefully offline.
 */
export function PropertyMap({
  location,
  title,
  className,
  height = 'h-[320px] sm:h-[420px]',
}: PropertyMapProps) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const { lat, lng } = location.coordinates;
  const delta = 0.01;

  const bbox = [lng - delta, lat - delta / 1.6, lng + delta, lat + delta / 1.6].join(',');
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const externalHref = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  return (
    <div className={cn('relative overflow-hidden rounded-3xl border border-line', height, className)}>
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
      <iframe
        title={`${title} — ${t('details.locationSection')}`}
        src={embedSrc}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full border-0 transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        referrerPolicy="no-referrer-when-downgrade"
      />

      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end sm:inset-x-4 sm:bottom-4">
        <a
          href={externalHref}
          target="_blank"
          rel="noreferrer noopener"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-panel px-4 py-2.5 text-[0.8125rem] font-semibold text-ink shadow-lift transition-colors hover:bg-elevated"
        >
          <MapPin className="h-4 w-4 text-accent-600" aria-hidden="true" />
          {t('details.openMap')}
          <ExternalLink className="h-3.5 w-3.5 text-subtle" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
