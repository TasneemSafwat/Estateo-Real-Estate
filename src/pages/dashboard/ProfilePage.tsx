import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { changePassword } from '@/services/authService';
import { updateProfile } from '@/store/slices/authSlice';
import { getErrorMessage } from '@/services/api/client';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Field } from '@/components/common/Field';
import { Input, Textarea } from '@/components/common/Input';

interface ProfileForm {
  name: string;
  phone: string;
  city: string;
  bio: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Profile and security settings for the signed-in account. */
export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const profileSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('errors.minLength', { count: 2 })),
        phone: z.string().min(6, t('errors.minLength', { count: 6 })),
        city: z.string().max(60, t('errors.maxLength', { count: 60 })),
        bio: z.string().max(280, t('errors.maxLength', { count: 280 })),
      }),
    [t],
  );

  const passwordSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t('errors.required')),
          newPassword: z
            .string()
            .min(8, t('errors.minLength', { count: 8 }))
            .regex(/[A-Z]/, t('errors.passwordRules'))
            .regex(/\d/, t('errors.passwordRules')),
          confirmPassword: z.string().min(1, t('errors.required')),
        })
        .refine((values) => values.newPassword === values.confirmPassword, {
          message: t('errors.passwordMatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      city: user?.city ?? '',
      bio: user?.bio ?? '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const saveProfile = profileForm.handleSubmit(async (values) => {
    if (!user) return;
    try {
      await dispatch(updateProfile({ userId: user.id, ...values })).unwrap();
      toast.success(t('dashboard.profileSaved'));
    } catch (thrown) {
      toast.error(t('common.error'), getErrorMessage(thrown));
    }
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordForm) =>
      changePassword(user?.id ?? '', values.currentPassword, values.newPassword),
    onSuccess: () => {
      toast.success(t('dashboard.passwordUpdated'));
      passwordForm.reset();
    },
    onError: (thrown) => toast.error(t('common.error'), getErrorMessage(thrown)),
  });

  const savePassword = passwordForm.handleSubmit((values) => passwordMutation.mutate(values));

  if (!user) return null;

  return (
    <div className="space-y-6">
      <section className="surface-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <UserRound className="h-4 w-4 text-accent-600" aria-hidden="true" />
              {t('dashboard.profileTitle')}
            </h2>
            <p className="mt-1 text-sm text-subtle">{t('dashboard.profileSubtitle')}</p>
          </div>
        </div>

        <form noValidate onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('auth.name')}
            htmlFor="profile-name"
            error={profileForm.formState.errors.name?.message}
            required
          >
            <Input
              id="profile-name"
              autoComplete="name"
              invalid={Boolean(profileForm.formState.errors.name)}
              {...profileForm.register('name')}
            />
          </Field>

          <Field label={t('auth.email')} htmlFor="profile-email">
            <Input id="profile-email" value={user.email} readOnly disabled />
          </Field>

          <Field
            label={t('details.yourPhone')}
            htmlFor="profile-phone"
            error={profileForm.formState.errors.phone?.message}
            required
          >
            <Input
              id="profile-phone"
              autoComplete="tel"
              invalid={Boolean(profileForm.formState.errors.phone)}
              {...profileForm.register('phone')}
            />
          </Field>

          <Field
            label={t('addProperty.cityField')}
            htmlFor="profile-city"
            error={profileForm.formState.errors.city?.message}
          >
            <Input
              id="profile-city"
              autoComplete="address-level2"
              invalid={Boolean(profileForm.formState.errors.city)}
              {...profileForm.register('city')}
            />
          </Field>

          <Field
            label={t('addProperty.descriptionField')}
            htmlFor="profile-bio"
            error={profileForm.formState.errors.bio?.message}
            className="sm:col-span-2"
          >
            <Textarea
              id="profile-bio"
              rows={3}
              invalid={Boolean(profileForm.formState.errors.bio)}
              {...profileForm.register('bio')}
            />
          </Field>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              isLoading={profileForm.formState.isSubmitting}
              loadingLabel={t('common.loading')}
              leftIcon={<Save className="h-4 w-4" aria-hidden="true" />}
            >
              {t('common.saveChanges')}
            </Button>
          </div>
        </form>
      </section>

      <section className="surface-card p-6">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <KeyRound className="h-4 w-4 text-accent-600" aria-hidden="true" />
            {t('dashboard.securityTitle')}
          </h2>
          <p className="mt-1 text-sm text-subtle">{t('dashboard.securitySubtitle')}</p>
        </div>

        <form noValidate onSubmit={savePassword} className="grid gap-4 sm:grid-cols-3">
          <Field
            label={t('dashboard.currentPassword')}
            htmlFor="profile-current"
            error={passwordForm.formState.errors.currentPassword?.message}
            required
          >
            <Input
              id="profile-current"
              type="password"
              autoComplete="current-password"
              invalid={Boolean(passwordForm.formState.errors.currentPassword)}
              {...passwordForm.register('currentPassword')}
            />
          </Field>

          <Field
            label={t('dashboard.newPassword')}
            htmlFor="profile-new"
            error={passwordForm.formState.errors.newPassword?.message}
            required
          >
            <Input
              id="profile-new"
              type="password"
              autoComplete="new-password"
              invalid={Boolean(passwordForm.formState.errors.newPassword)}
              {...passwordForm.register('newPassword')}
            />
          </Field>

          <Field
            label={t('auth.confirmPassword')}
            htmlFor="profile-confirm"
            error={passwordForm.formState.errors.confirmPassword?.message}
            required
          >
            <Input
              id="profile-confirm"
              type="password"
              autoComplete="new-password"
              invalid={Boolean(passwordForm.formState.errors.confirmPassword)}
              {...passwordForm.register('confirmPassword')}
            />
          </Field>

          <div className="sm:col-span-3">
            <Button
              type="submit"
              variant="outline"
              isLoading={passwordMutation.isPending}
              loadingLabel={t('common.loading')}
            >
              {t('dashboard.updatePassword')}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
