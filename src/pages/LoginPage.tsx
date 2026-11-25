import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import type { LoginPayload } from '@/types';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';
import { Button, IconButton } from '@/components/common/Button';
import { Field } from '@/components/common/Field';
import { Input } from '@/components/common/Input';
import { Checkbox } from '@/components/common/Checkbox';
import { DemoCredentialsCard } from '@/components/auth/DemoCredentialsCard';

/** Mock sign-in screen. See `services/authService.ts` for the demo caveat. */
export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, resetError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('errors.required')).email(t('errors.email')),
        password: z.string().min(1, t('errors.required')),
        remember: z.boolean(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard;

  const onSubmit = handleSubmit(async (values) => {
    resetError();
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch {
      /* Surfaced through `error` below. */
    }
  });

  const fillDemo = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl leading-tight sm:text-[1.75rem]">{t('auth.loginTitle')}</h1>
        <p className="mt-2 text-sm text-subtle">{t('auth.loginSubtitle')}</p>
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
        <Field label={t('auth.email')} htmlFor="login-email" error={errors.email?.message} required>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field
          label={t('auth.password')}
          htmlFor="login-password"
          error={errors.password?.message}
          required
        >
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={Boolean(errors.password)}
            endAdornment={
              <IconButton
                label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                size="sm"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </IconButton>
            }
            {...register('password')}
          />
        </Field>

        <div className="flex items-center justify-between gap-3">
          <Checkbox id="login-remember" label={t('auth.remember')} {...register('remember')} />
          <Link
            to={ROUTES.forgotPassword}
            className="link-underline text-sm font-medium text-accent-700 dark:text-accent-300"
          >
            {t('auth.forgotLink')}
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingLabel={t('common.loading')}
          leftIcon={<LogIn className="h-4 w-4" aria-hidden="true" />}
        >
          {t('auth.loginCta')}
        </Button>
      </form>

      <DemoCredentialsCard onUse={fillDemo} />

      <p className="text-center text-sm text-subtle">
        {t('auth.noAccount')}{' '}
        <Link
          to={ROUTES.register}
          className="link-underline font-semibold text-ink"
        >
          {t('auth.createOne')}
        </Link>
      </p>
    </div>
  );
}
