import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  BedDouble,
  Bath,
  CalendarCheck,
  Link2,
  MapPin,
  Maximize,
  Phone,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Agent, Property } from '@/types';
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_LABELS_AR, ROUTES } from '@/utils/constants';
import { formatArea } from '@/utils/format';
import { estimateMonthlyPayment } from '@/utils/mortgage';
import { REEL_VIDEOS } from '@/services/mock/reelVideos';
import { useCurrency } from '@/hooks/useCurrency';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useToast } from '@/hooks/useToast';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { buttonStyles } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { FavoriteButton } from '@/components/property/FavoriteButton';
import { CompareButton } from '@/components/property/CompareButton';
import { ContactAgentForm } from '@/components/property/ContactAgentForm';
import { TiltCard } from '@/components/three-d';
import { ReelMedia } from './ReelMedia';
import { useLocalizedAgent, useLocalizedProperty } from '@/hooks/useLocalized';

export interface ReelItemProps {
  property: Property;
  agent?: Agent;
  active: boolean;
  /** Only slides near the viewport mount their media. */
  mounted: boolean;
  muted: boolean;
  onToggleMute: () => void;
  index: number;
  total: number;
}

function RailButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
    >
      {children}
    </button>
  );
}

/**
 * One full-screen reel: the media, an action rail and the "shop this home"
 * panel with price, estimated payment, advisor and booking.
 */
export function ReelItem({
  property: rawProperty,
  agent: rawAgent,
  active,
  mounted,
  muted,
  onToggleMute,
  index,
  total,
}: ReelItemProps) {
  const { t, i18n } = useTranslation();
  const { priceOf, format, locale } = useCurrency();
  const property = useLocalizedProperty(rawProperty);
  const agent = useLocalizedAgent(rawAgent);
  const toast = useToast();
  const { copy } = useCopyToClipboard();
  const [booking, setBooking] = useState(false);
  const [videoMissing, setVideoMissing] = useState(false);

  const video = REEL_VIDEOS[property.id];
  const hasVideo = Boolean(video) && !videoMissing;

  const typeLabel =
    i18n.language === 'ar'
      ? PROPERTY_TYPE_LABELS_AR[property.type]
      : PROPERTY_TYPE_LABELS[property.type];

  const isSale = property.listingType === 'sale';
  const monthly = isSale ? estimateMonthlyPayment(property.price) : 0;
  const href = ROUTES.property(property.id);
  const label = `${property.title}, ${property.location.city}`;

  const share = useCallback(async () => {
    const url = `${window.location.origin}${href}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url });
        return;
      } catch {
        /* dismissed: fall through to copy */
      }
    }
    if (await copy(url)) toast.success(t('reels.linkCopied'));
  }, [copy, href, property.title, t, toast]);

  return (
    <section
      aria-roledescription="reel"
      aria-label={`${index + 1} / ${total}: ${label}`}
      data-reel-index={index}
      className="relative flex h-dvh w-full snap-start snap-always items-center justify-center md:py-4"
    >
      <TiltCard
        maxTilt={2.5}
        glare={false}
        wrapperClassName="h-full w-full md:w-auto"
        className="h-full w-full overflow-hidden bg-brand-950 md:aspect-[9/16] md:w-auto md:rounded-[2rem] md:shadow-lift md:ring-1 md:ring-white/15"
      >
        {mounted ? (
          <ReelMedia
            frames={property.images.length ? property.images : [property.coverImage]}
            video={video}
            title={label}
            active={active}
            paused={booking}
            muted={muted}
            onVideoMissing={() => setVideoMissing(true)}
          />
        ) : (
          <img
            src={property.coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Shop this home */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-3 pb-4 sm:p-4">
        {/* Action rail */}
        <div className="flex flex-col items-center gap-3 self-end pe-1">
          <FavoriteButton propertyId={property.id} />
          <CompareButton propertyId={property.id} />
          <RailButton label={t('reels.share')} onClick={share}>
            <Link2 className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
          </RailButton>
          {hasVideo && (
            <RailButton label={muted ? t('reels.unmute') : t('reels.mute')} onClick={onToggleMute}>
              {muted ? (
                <VolumeX className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
              ) : (
                <Volume2 className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
              )}
            </RailButton>
          )}
        </div>

          <div className="rounded-3xl border border-white/15 bg-brand-950/55 p-4 text-white backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{isSale ? t('reels.buy') : t('reels.rent')}</Badge>
              <span className="text-xs font-medium text-white/75">{typeLabel}</span>
              <span className="ms-auto text-[0.6875rem] font-semibold text-accent-300">
                {hasVideo ? t('reels.videoTour') : t('reels.photoTour')}
              </span>
            </div>

            <h2 className="mt-2 line-clamp-1 text-lg font-semibold leading-snug">{property.title}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-white/75">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-accent-400" aria-hidden="true" />
              <span className="line-clamp-1">
                {property.location.city}, {property.location.country}
              </span>
            </p>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold leading-none">{priceOf(property)}</p>
                {isSale && (
                  <p
                    className="mt-1.5 text-[0.75rem] text-white/70"
                    title={t('reels.estNote')}
                  >
                    {t('reels.estMonthly')}:{' '}
                    <span className="font-semibold text-white">
                      {format(Math.round(monthly), property.currency, { period: 'month' })}
                    </span>
                  </p>
                )}
              </div>
              <ul className="flex items-center gap-3 text-xs text-white/80">
                <li className="inline-flex items-center gap-1">
                  <BedDouble className="h-3.5 w-3.5 text-accent-400" aria-hidden="true" />
                  {property.bedrooms}
                </li>
                <li className="inline-flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5 text-accent-400" aria-hidden="true" />
                  {property.bathrooms}
                </li>
                <li className="inline-flex items-center gap-1">
                  <Maximize className="h-3.5 w-3.5 text-accent-400" aria-hidden="true" />
                  {formatArea(property.area, locale)}
                </li>
              </ul>
            </div>

            {agent && (
              <div className="mt-3 flex items-center gap-2.5 border-t border-white/12 pt-3">
                <Avatar src={agent.avatar} name={agent.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">{agent.name}</p>
                  <p className="truncate text-[0.75rem] text-white/65">{agent.title}</p>
                </div>
                <a
                  href={`tel:${agent.phone.replace(/[^+\d]/g, '')}`}
                  aria-label={t('reels.callAgent')}
                  title={t('reels.callAgent')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/25"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            )}

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                onClick={() => setBooking(true)}
                className={cn(buttonStyles({ variant: 'accent', size: 'md' }), 'w-full')}
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                {t('reels.bookViewing')}
              </button>
              <Link
                to={href}
                className={buttonStyles({
                  variant: 'outline',
                  size: 'md',
                  className: 'border-white/30 text-white hover:border-white/60 hover:bg-white/10',
                })}
              >
                {t('reels.viewDetails')}
                <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </TiltCard>

      <Modal
        open={booking}
        onClose={() => setBooking(false)}
        title={t('reels.bookTitle')}
        description={label}
        size="md"
      >
        <ContactAgentForm propertyId={property.id} agentName={agent?.name} />
      </Modal>
    </section>
  );
}
