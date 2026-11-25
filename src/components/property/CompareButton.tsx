import { GitCompareArrows } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { useComparison } from '@/hooks/useComparison';
import { useToast } from '@/hooks/useToast';

export interface CompareButtonProps {
  propertyId: string;
  variant?: 'floating' | 'inline';
  size?: 'sm' | 'md';
  /** Renders a text label next to the icon. */
  showLabel?: boolean;
  className?: string;
}

/**
 * Adds or removes a property from the comparison tray, enforcing the
 * configured maximum and explaining the limit through a toast.
 */
export function CompareButton({
  propertyId,
  variant = 'floating',
  size = 'md',
  showLabel = false,
  className,
}: CompareButtonProps) {
  const { t } = useTranslation();
  const { isSelected, toggle, tryAdd, limit } = useComparison();
  const toast = useToast();
  const active = isSelected(propertyId);

  const dimension = showLabel ? 'h-9 px-3' : size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-[1.15rem] w-[1.15rem]';

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (active) {
      toggle(propertyId);
      toast.info(t('compare.removed'));
      return;
    }

    if (!tryAdd(propertyId)) {
      toast.warning(t('compare.limitReached', { limit }));
      return;
    }
    toast.success(t('compare.added'));
  };

  return (
    <button
      type="button"
      aria-label={active ? t('compare.removed') : t('compare.added')}
      aria-pressed={active}
      title={active ? t('compare.removed') : t('compare.added')}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full text-[0.8125rem] font-semibold transition-all duration-200 active:scale-95',
        dimension,
        variant === 'floating'
          ? 'glass shadow-soft hover:bg-panel'
          : 'border border-line bg-panel hover:border-brand-800/30',
        active && 'bg-brand-800 text-white hover:bg-brand-700',
        className,
      )}
    >
      <GitCompareArrows
        aria-hidden="true"
        className={cn(icon, !active && 'text-ink/70', active && 'text-white')}
      />
      {showLabel && <span>{t('common.compare')}</span>}
    </button>
  );
}
