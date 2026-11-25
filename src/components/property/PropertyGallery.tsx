import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { cn } from '@/utils/cn';
import { IconButton } from '@/components/common/Button';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { Modal } from '@/components/common/Modal';

export interface PropertyGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

/**
 * Property image gallery: a large hero frame, a thumbnail rail and a
 * full-screen lightbox with keyboard navigation (← / → / Esc) and counter.
 */
export function PropertyGallery({ images, title, className }: PropertyGalleryProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % images.length) + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goTo(index + 1);
      if (event.key === 'ArrowLeft') goTo(index - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, index, goTo]);

  if (images.length === 0) return null;

  const thumbs = images.slice(1, 5);

  return (
    <>
      <div className={cn('grid gap-3 lg:grid-cols-[1.9fr_1fr]', className)}>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
          className="group relative overflow-hidden rounded-3xl focus-visible:outline-none"
          aria-label={t('details.viewGallery')}
        >
          <ImageWithFallback
            src={images[0]}
            alt={title}
            aspect="aspect-[16/11] lg:h-full lg:aspect-auto"
            priority
            className="transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-4 start-4">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold text-ink shadow-soft">
              <Images className="h-4 w-4" aria-hidden="true" />
              {t('details.viewGallery')} ({images.length})
            </span>
          </span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {thumbs.map((src, thumbIndex) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setIndex(thumbIndex + 1);
                setOpen(true);
              }}
              className="group relative overflow-hidden rounded-2xl focus-visible:outline-none"
              aria-label={t('details.imageOf', { current: thumbIndex + 2, total: images.length })}
            >
              <ImageWithFallback
                src={src}
                alt={`${title} — ${thumbIndex + 2}`}
                aspect="aspect-[4/3]"
                className="transition-transform duration-500 ease-smooth group-hover:scale-[1.05]"
              />
            </button>
          ))}
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="full"
        bare
        className="bg-brand-950/95"
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <img
            key={images[index]}
            src={images[index]}
            alt={`${title} — ${index + 1}`}
            className="max-h-full max-w-full rounded-xl object-contain"
          />

          {images.length > 1 && (
            <>
              <IconButton
                label={t('details.previousImage')}
                onClick={() => goTo(index - 1)}
                className="absolute start-3 top-1/2 -translate-y-1/2 bg-white/12 text-white hover:bg-white/25 hover:text-white sm:start-5"
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </IconButton>
              <IconButton
                label={t('details.nextImage')}
                onClick={() => goTo(index + 1)}
                className="absolute end-3 top-1/2 -translate-y-1/2 bg-white/12 text-white hover:bg-white/25 hover:text-white sm:end-5"
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </IconButton>
            </>
          )}

          <p
            aria-live="polite"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/12 px-4 py-1.5 text-xs font-semibold text-white"
          >
            {t('details.imageOf', { current: index + 1, total: images.length })}
          </p>
        </div>
      </Modal>
    </>
  );
}
