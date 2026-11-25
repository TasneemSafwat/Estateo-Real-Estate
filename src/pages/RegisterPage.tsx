import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button, IconButton } from '@/components/common/Button';
import { Field } from '@/components/common/Field';
import { Input } from '@/components/common/Input';
import { Checkbox } from '@/components/common/Checkbox';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

/** Mock account creation screen. */
export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, resetError } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, t('errors.minLength', { count: 2 })),
          email: z.string().min(1, t('errors.required')).email(t('errors.email')),
          password: z
            .string()
            .min(8, t('errors.minLength', { count: 8 }))
            .regex(/[A-Z]/, t('errors.passwordRules'))
            .regex(/\d/, t('errors.passwordRules')),
          confirmPassword: z.string().min(1, t('errors.required')),
          terms: z.boolean().refine((value) => value === true, { message: t('errors.terms') }),
        })
        .refine((values) => values.password === values.confirmPassword, {
          message: t('errors.passwordMatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false },
  });

  const passwordValue = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    resetError();
    try {
      await registerUser({ name: values.name, email: values.email, password: values.password });
      toast.success(t('auth.registerSuccess'));
      navigate(ROUTES.dashboard, { replace: true });
    } catch {
      /* Surfaced through `error` below. */
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl leading-tight sm:text-[1.75rem]">{t('auth.registerTitle')}</h1>
        <p className="mt-2 text-sm text-subtle">{t('auth.registerSubtitle')}</p>
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
        <Field label={t('auth.name')} htmlFor="register-name" error={errors.name?.message} required>
          <Input
            id="register-name"
            autoComplete="name"
            placeholder="Jane Doe"
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </Field>

        <Field
          label={t('auth.email')}
          htmlFor="register-email"
          error={errors.email?.message}
          required
        >
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field
          label={t('auth.password')}
          htmlFor="register-password"
          error={errors.password?.message}
          required
        >
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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
          <PasswordStrength value={passwordValue} />
        </Field>

        <Field
          label={t('auth.confirmPassword')}
          htmlFor="register-confirm"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </Field>

        <div>
          <Checkbox id="register-terms" label={t('auth.terms')} {...register('terms')} />
          {errors.terms?.message && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingLabel={t('common.loading')}
          leftIcon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
        >
          {t('auth.registerCta')}
        </Button>
      </form>

      <p className="text-center text-sm text-subtle">
        {t('auth.haveAccount')}{' '}
        <Link to={ROUTES.login} className="link-underline font-semibold text-ink">
          {t('auth.signInInstead')}
        </Link>
      </p>
    </div>
  );
}
