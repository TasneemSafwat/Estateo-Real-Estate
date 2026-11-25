import { useTranslation } from 'react-i18next';
import type { Amenity } from '@/types';
import { DynamicIcon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/Feedback';
import { Sparkles } from 'lucide-react';

export interface AmenityListProps {
  amenities: Amenity[];
}

/**
 * Amenities are presented as a two-column feature list so the value of the
 * listing is scannable rather than a wall of pills.
 */
export function AmenityList({ amenities }: AmenityListProps) {
  const { t, i18n } = useTranslation();

  if (amenities.length === 0) {
    return (
      <EmptyState
        title={t('common.noResults')}
        icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
      />
    );
  }

  return (
    <ul className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {amenities.map((amenity) => (
        <li key={amenity.id} className="flex items-center gap-3 text-sm text-ink/85">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/12 text-accent-700 dark:text-accent-300">
            <DynamicIcon name={amenity.icon} className="h-[1.1rem] w-[1.1rem]" />
          </span>
          {i18n.language === 'ar' ? amenity.labelAr : amenity.label}
        </li>
      ))}
    </ul>
  );
}
