import { useTranslation } from 'react-i18next';
import { PlusCircle, RefreshCcw, Trash2, TrendingUp, UserPlus } from 'lucide-react';
import type { ActivityEntry } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { formatRelativeTime } from '@/utils/format';

const ICONS: Record<ActivityEntry['type'], React.ReactNode> = {
  create: <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />,
  update: <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />,
  delete: <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />,
  login: <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />,
  publish: <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />,
};

export interface ActivityFeedProps {
  entries: ActivityEntry[];
}

/** Recent catalogue and account activity rendered as a timeline. */
export function ActivityFeed({ entries }: ActivityFeedProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-subtle">{t('admin.noRows')}</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {entries.slice(0, 8).map((entry) => (
        <li key={entry.id} className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0">
          <Avatar src={entry.actorAvatar} name={entry.actor} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug text-ink">
              <span className="font-semibold">{entry.actor}</span>{' '}
              <span className="text-subtle">{entry.action}</span>{' '}
              <span className="font-medium text-ink/90">{entry.target}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-2xs text-subtle">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-800/6 dark:bg-white/10">
                {ICONS[entry.type]}
              </span>
              {formatRelativeTime(entry.createdAt, locale)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
