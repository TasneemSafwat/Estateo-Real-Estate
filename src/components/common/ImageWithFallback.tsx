import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { fallbackPhoto } from '@/utils/images';

export interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  /** Tailwind aspect utility, e.g. `aspect-[4/3]`. */
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  children?: React.ReactNode;
}

/**
 * Image wrapper that fades in on load and degrades to a branded placeholder
 * when the source is unavailable — no broken image icons anywhere in the UI.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  wrapperClassName,
  aspect,
  priority = false,
  children,
}: ImageWithFallbackProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    setStatus('loading');
    setTriedFallback(false);
  }, [src]);

  // If a photo fails to load, swap once to another real photo before giving up.
  const activeSrc = triedFallback ? fallbackPhoto(src) : src;

  const handleError = () => {
    if (!triedFallback) {
      setTriedFallback(true);
      setStatus('loading');
      return;
    }
    setStatus('error');
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-brand-800/6 dark:bg-white/6',
        aspect,
        wrapperClassName,
      )}
    >
      {status !== 'error' && (
        <img
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          onLoad={() => setStatus('loaded')}
          onError={handleError}
          className={cn(
            'h-full w-full object-cover transition-[opacity,transform] duration-700 ease-smooth',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            className,
          )}
        />
      )}

      {status === 'loading' && <div className="absolute inset-0 skeleton" aria-hidden="true" />}

      {status === 'error' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-800/12 via-mist-200/40 to-accent-500/12 text-subtle dark:from-brand-800/40 dark:via-brand-900/40 dark:to-accent-900/20"
          role="img"
          aria-label={alt}
        >
          <ImageOff className="h-6 w-6" aria-hidden="true" />
          <span className="px-4 text-center text-[0.75rem] font-medium">
            {t('common.imageUnavailable', { defaultValue: 'Image unavailable' })}
          </span>
        </div>
      )}

      {children}
    </div>
  );
}
