import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { fallbackPhoto } from '@/utils/images';
import type { ReelVideo } from '@/services/mock/reelVideos';

const FRAME_MS = 3800;
const TAP_MS = 260;
const MAX_FRAMES = 6;

export interface ReelMediaProps {
  frames: string[];
  video?: ReelVideo;
  title: string;
  /** This reel is the one on screen. */
  active: boolean;
  /** A dialog is open or the viewer is holding the screen. */
  paused: boolean;
  muted: boolean;
  onVideoMissing?: () => void;
}

function handleImageError(event: React.SyntheticEvent<HTMLImageElement>, src: string) {
  const image = event.currentTarget;
  if (image.dataset.fallback) return;
  image.dataset.fallback = '1';
  image.src = fallbackPhoto(src);
}

function TourFrame({
  src,
  current,
  index,
  progress,
  animate,
}: {
  src: string;
  current: boolean;
  index: number;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  const direction = index % 2 === 0 ? 1 : -1;
  const scale = useTransform(progress, [0, 1], [1.03, 1.16]);
  const x = useTransform(progress, [0, 1], [0, direction * -22]);
  const live = animate && current;

  return (
    <motion.img
      src={src}
      alt=""
      draggable={false}
      loading={index === 0 ? 'eager' : 'lazy'}
      onError={(event) => handleImageError(event, src)}
      style={live ? { scale, x } : { scale: animate ? 1.16 : 1.03, x: 0 }}
      className={cn(
        'absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-500',
        current ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}

/**
 * The picture of a reel. Plays a real video when one is configured, otherwise
 * a photo tour with slow camera moves, story-style progress and tap / hold
 * controls. Falls back from video to photos if the file cannot be played.
 */
export function ReelMedia({
  frames,
  video,
  title,
  active,
  paused,
  muted,
  onVideoMissing,
}: ReelMediaProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const photos = frames.slice(0, MAX_FRAMES);

  const [videoFailed, setVideoFailed] = useState(false);
  const useVideo = Boolean(video) && !videoFailed;

  const [index, setIndex] = useState(0);
  const progress = useMotionValue(0);
  const holding = useRef(false);
  const press = useRef<{ time: number; x: number; y: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Rewind the tour whenever the reel leaves the screen.
  useEffect(() => {
    if (!active) {
      setIndex(0);
      progress.set(0);
    }
  }, [active, progress]);

  useAnimationFrame((_, delta) => {
    if (useVideo || reduceMotion || !active || paused || holding.current) return;
    const next = progress.get() + delta / FRAME_MS;
    if (next >= 1) {
      setIndex((value) => (value + 1) % photos.length);
      progress.set(0);
    } else {
      progress.set(next);
    }
  });

  // Video playback follows visibility.
  useEffect(() => {
    const element = videoRef.current;
    if (!element || !useVideo) return;
    if (active && !paused) {
      element.play().catch(() => {
        element.muted = true;
        element.play().catch(() => setVideoFailed(true));
      });
    } else {
      element.pause();
      if (!active) element.currentTime = 0;
    }
  }, [active, paused, useVideo]);

  useEffect(() => {
    if (videoFailed) onVideoMissing?.();
  }, [videoFailed, onVideoMissing]);

  const go = (step: number) => {
    setIndex((value) => (value + step + photos.length) % photos.length);
    progress.set(0);
  };

  const handleDown = (event: PointerEvent<HTMLDivElement>) => {
    press.current = { time: Date.now(), x: event.clientX, y: event.clientY };
    holding.current = true;
    if (useVideo) videoRef.current?.pause();
  };

  const handleUp = (event: PointerEvent<HTMLDivElement>, side: 'start' | 'end') => {
    holding.current = false;
    const start = press.current;
    press.current = null;
    if (useVideo) {
      if (active && !paused) videoRef.current?.play().catch(() => undefined);
      return;
    }
    if (!start) return;
    const quick = Date.now() - start.time < TAP_MS;
    const still = Math.abs(event.clientX - start.x) < 10 && Math.abs(event.clientY - start.y) < 10;
    if (quick && still) {
      // "start" is the leading edge: left in LTR, right in RTL.
      go(side === 'end' ? 1 : -1);
    }
  };

  const cancel = () => {
    holding.current = false;
    press.current = null;
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-brand-950">
      {useVideo && video ? (
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster ?? photos[0]}
          muted={muted}
          loop
          playsInline
          preload={active ? 'auto' : 'metadata'}
          onTimeUpdate={(event) => {
            const element = event.currentTarget;
            if (element.duration) progress.set(element.currentTime / element.duration);
          }}
          onError={() => setVideoFailed(true)}
          aria-label={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        photos.map((src, frameIndex) => (
          <TourFrame
            key={src}
            src={src}
            index={frameIndex}
            current={frameIndex === index}
            progress={progress}
            animate={!reduceMotion}
          />
        ))
      )}

      {/* Readability scrims */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-brand-950/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-brand-950/95 via-brand-950/55 to-transparent" />

      {/* Story-style progress */}
      <div
        className="absolute inset-x-3 top-14 z-10 flex gap-1.5 sm:top-4"
        role="progressbar"
        aria-label={useVideo ? t('reels.videoTour') : t('reels.photoTour')}
        aria-valuemin={1}
        aria-valuemax={useVideo ? 1 : photos.length}
        aria-valuenow={useVideo ? 1 : index + 1}
        aria-valuetext={t('reels.frame', { current: index + 1, total: photos.length })}
      >
        {(useVideo ? [0] : photos.map((_, i) => i)).map((segment) => (
          <span key={segment} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
            <motion.span
              className="block h-full w-full origin-left rounded-full bg-white rtl:origin-right"
              style={{
                scaleX: useVideo
                  ? progress
                  : segment < index
                    ? 1
                    : segment === index
                      ? reduceMotion
                        ? 1
                        : progress
                      : 0,
              }}
            />
          </span>
        ))}
      </div>

      {/* Tap zones: leading edge goes back, trailing edge goes forward; hold to pause */}
      {!useVideo && photos.length > 1 && (
        <>
          <div
            className="absolute inset-y-24 start-0 z-[5] w-1/3 touch-pan-y"
            onPointerDown={handleDown}
            onPointerUp={(event) => handleUp(event, 'start')}
            onPointerLeave={cancel}
            onPointerCancel={cancel}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-24 end-0 z-[5] w-1/3 touch-pan-y"
            onPointerDown={handleDown}
            onPointerUp={(event) => handleUp(event, 'end')}
            onPointerLeave={cancel}
            onPointerCancel={cancel}
            aria-hidden="true"
          />
        </>
      )}
      {useVideo && (
        <div
          className="absolute inset-y-24 inset-x-0 z-[5] touch-pan-y"
          onPointerDown={handleDown}
          onPointerUp={(event) => handleUp(event, 'end')}
          onPointerLeave={cancel}
          onPointerCancel={cancel}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
