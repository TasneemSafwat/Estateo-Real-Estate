import { useTranslation } from 'react-i18next';
import { Info, ShieldCheck, User } from 'lucide-react';
import { DEMO_CREDENTIALS } from '@/services/mock/users.data';
import { Button } from '@/components/common/Button';

export interface DemoCredentialsCardProps {
  onUse: (email: string, password: string) => void;
}

/**
 * Explains that authentication is mocked for this front-end demo and offers
 * one-click fill for the seeded admin and buyer accounts.
 */
export function DemoCredentialsCard({ onUse }: DemoCredentialsCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-accent-500/30 bg-accent-500/[0.07] p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/18 text-accent-700 dark:text-accent-300">
          <Info className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{t('auth.demoTitle')}</p>
          <p className="mt-1 text-xs leading-relaxed text-subtle">{t('auth.demoBody')}</p>

          <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
            <DemoRow
              icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              label={t('auth.demoAdmin')}
              email={DEMO_CREDENTIALS.admin.email}
              password={DEMO_CREDENTIALS.admin.password}
              cta={t('auth.useAdmin')}
              onUse={onUse}
            />
            <DemoRow
              icon={<User className="h-4 w-4" aria-hidden="true" />}
              label={t('auth.demoUser')}
              email={DEMO_CREDENTIALS.user.email}
              password={DEMO_CREDENTIALS.user.password}
              cta={t('auth.useUser')}
              onUse={onUse}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DemoRowProps {
  icon: React.ReactNode;
  label: string;
  email: string;
  password: string;
  cta: string;
  onUse: (email: string, password: string) => void;
}

function DemoRow({ icon, label, email, password, cta, onUse }: DemoRowProps) {
  return (
    <div className="rounded-xl border border-line bg-panel/70 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
        <span className="text-subtle">{icon}</span>
        {label}
      </p>
      <dl className="mt-2 space-y-1 text-2xs text-subtle">
        <div className="flex items-center justify-between gap-2">
          <dt>Email</dt>
          <dd className="truncate font-medium text-ink/80">{email}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Password</dt>
          <dd className="font-medium text-ink/80">{password}</dd>
        </div>
      </dl>
      <Button
        variant="outline"
        size="sm"
        fullWidth
        className="mt-2.5 h-8 text-2xs"
        onClick={() => onUse(email, password)}
      >
        {cta}
      </Button>
    </div>
  );
}
