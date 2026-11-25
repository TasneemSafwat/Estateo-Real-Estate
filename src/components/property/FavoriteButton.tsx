import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/useToast';

export interface FavoriteButtonProps {
  propertyId: string;
  /** Visual treatment — `floating` sits on top of imagery, `inline` in a toolbar. */
  variant?: 'floating' | 'inline';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Persistent shortlist toggle. State lives in Redux and is mirrored to
 * localStorage, so it survives reloads without any backend.
 */
export function FavoriteButton({
  propertyId,
  variant = 'floating',
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { isFavorite, toggle } = useFavorites();
  const toast = useToast();
  const active = isFavorite(propertyId);

  const dimension = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-[1.15rem] w-[1.15rem]';

  return (
    <button
      type="button"
      aria-label={active ? t('common.unshortlisted') : t('common.shortlisted')}
      aria-pressed={active}
      title={active ? t('common.unshortlisted') : t('common.shortlisted')}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(propertyId);
        if (active) toast.info(t('common.unshortlisted'));
        else toast.success(t('common.shortlisted'));
      }}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200 active:scale-95',
        dimension,
        variant === 'floating'
          ? 'glass shadow-soft hover:bg-panel'
          : 'border border-line bg-panel hover:border-brand-800/30',
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn(
          icon,
          'transition-colors',
          active ? 'fill-accent-500 text-accent-500' : 'text-ink/70',
        )}
      />
    </button>
  );
}
