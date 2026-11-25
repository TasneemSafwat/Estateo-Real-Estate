import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { getErrorMessage } from '@/services/api/client';
import { requestPasswordReset } from '@/services/authService';
import { Button } from '@/components/common/Button';
import { Field } from '@/components/common/Field';
import { Input } from '@/components/common/Input';

/** Password reset request screen — always responds without revealing accounts. */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('errors.required')).email(t('errors.email')),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await requestPasswordReset(email);
      setSentMessage(result.message);
    } catch (thrown) {
      setError(getErrorMessage(thrown));
    } finally {
      setIsLoading(false);
    }
  });

  if (sentMessage) {
    return (
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/14 text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl leading-tight">{t('auth.resetSent')}</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-subtle">{sentMessage}</p>
        <Link to={ROUTES.login} className="mt-7">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />}
          >
            {t('auth.backToLogin')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl leading-tight sm:text-[1.75rem]">{t('auth.forgotTitle')}</h1>
        <p className="mt-2 text-sm text-subtle">{t('auth.forgotSubtitle')}</p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3 text-sm text-red-600 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label={t('auth.email')} htmlFor="forgot-email" error={errors.email?.message} required>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
            startIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
            {...register('email')}
          />
        </Field>

        <Button type="submit" size="lg" fullWidth isLoading={isLoading} loadingLabel={t('common.loading')}>
          {t('auth.forgotCta')}
        </Button>
      </form>

      <p className="text-center text-sm text-subtle">
        <Link
          to={ROUTES.login}
          className="link-underline inline-flex items-center gap-1.5 font-semibold text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  );
}
