import { useTranslation } from 'react-i18next';
import { BadgeCheck, Building2, Mail, MessageSquare, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Agent } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Rating } from '@/components/common/Rating';
import { Button } from '@/components/common/Button';
import { useLocalizedAgent } from '@/hooks/useLocalized';

export interface AgentCardProps {
  agent: Agent;
  onContact?: () => void;
  className?: string;
}

/** Listing agent summary with direct contact channels. */
export function AgentCard({ agent: rawAgent, onContact, className }: AgentCardProps) {
  const { t } = useTranslation();
  const agent = useLocalizedAgent(rawAgent);

  return (
    <div className={cn('surface-card p-6', className)}>
      <div className="flex items-center gap-4">
        <Avatar src={agent.avatar} name={agent.name} size="lg" />
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-base font-semibold text-ink">
            {agent.name}
            <BadgeCheck className="h-4 w-4 text-accent-600" aria-hidden="true" />
          </p>
          <p className="text-sm text-subtle">{agent.title}</p>
          <Rating value={agent.rating} className="mt-1.5" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-subtle">{agent.bio}</p>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex items-center gap-2.5 text-ink/80">
          <Building2 className="h-4 w-4 text-accent-600" aria-hidden="true" />
          <dt className="sr-only">{t('details.agent')}</dt>
          <dd>
            {agent.listingsCount} {t('common.results', { count: agent.listingsCount })}
          </dd>
        </div>
        <div className="flex items-center gap-2.5 text-ink/80">
          <Phone className="h-4 w-4 text-accent-600" aria-hidden="true" />
          <dt className="sr-only">{t('details.yourPhone')}</dt>
          <dd>
            <a href={`tel:${agent.phone.replace(/[^+\d]/g, '')}`} className="link-underline">
              {agent.phone}
            </a>
          </dd>
        </div>
        <div className="flex items-center gap-2.5 text-ink/80">
          <Mail className="h-4 w-4 text-accent-600" aria-hidden="true" />
          <dt className="sr-only">{t('details.yourEmail')}</dt>
          <dd>
            <a href={`mailto:${agent.email}`} className="link-underline break-all">
              {agent.email}
            </a>
          </dd>
        </div>
      </dl>

      {agent.languages.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {agent.languages.map((language) => (
            <span
              key={language}
              className="rounded-full bg-brand-800/6 px-2.5 py-1 text-2xs font-semibold text-ink/70 dark:bg-white/8"
            >
              {language}
            </span>
          ))}
        </div>
      )}

      {onContact && (
        <Button
          variant="primary"
          fullWidth
          className="mt-6"
          leftIcon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
          onClick={onContact}
        >
          {t('details.contactAgent')}
        </Button>
      )}
    </div>
  );
}
