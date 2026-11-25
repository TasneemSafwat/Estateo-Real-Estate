import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

export interface PasswordStrengthProps {
  value: string;
  className?: string;
}

/** Scores a password 0–4 and renders a labelled strength meter. */
export function scorePassword(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 12) score += 1;
  return score;
}

const TONES = [
  'bg-red-500',
  'bg-red-500',
  'bg-amber-500',
  'bg-accent-500',
  'bg-emerald-500',
] as const;

export function PasswordStrength({ value, className }: PasswordStrengthProps) {
  const { t } = useTranslation();
  const score = scorePassword(value);
  const labelKey = ['weak', 'weak', 'fair', 'good', 'strong'][score] as
    | 'weak'
    | 'fair'
    | 'good'
    | 'strong';

  if (!value) return null;

  return (
    <div className={cn('mt-2', className)} aria-live="polite">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              segment <= score ? TONES[score] : 'bg-line',
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-2xs font-medium text-subtle">
        {t('auth.password')}: {t(`auth.strength.${labelKey}`)}
      </p>
    </div>
  );
}
