import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Bell, Globe2, Save } from 'lucide-react';
import type { UserPreferences } from '@/types';
import { fetchCities, queryKeys } from '@/services/propertyService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { patchPreferences } from '@/store/slices/preferencesSlice';
import { useToast } from '@/hooks/useToast';
import { CURRENCY_OPTIONS } from '@/utils/constants';
import { LANGUAGE_META, SUPPORTED_LANGUAGES } from '@/i18n';
import { Button } from '@/components/common/Button';
import { Field } from '@/components/common/Field';
import { Select } from '@/components/common/Select';
import { Switch } from '@/components/common/Checkbox';

type PreferencesForm = Pick<
  UserPreferences,
  | 'theme'
  | 'language'
  | 'currency'
  | 'defaultListingType'
  | 'preferredCity'
  | 'emailNotifications'
  | 'priceAlerts'
  | 'weeklyDigest'
>;

/** Currency, language and notification preferences for the signed-in account. */
export default function PreferencesPage() {
  const { t, i18n } = useTranslation();
  const preferences = useAppSelector((state) => state.preferences);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isArabic = i18n.language === 'ar';

  const citiesQuery = useQuery({
    queryKey: queryKeys.catalog.cities,
    queryFn: ({ signal }) => fetchCities(signal),
    staleTime: 5 * 60 * 1000,
  });

  const cityOptions = useMemo(
    () => [
      { value: 'all', label: t('common.all') },
      ...(citiesQuery.data ?? []).map((city) => ({
        value: city.name,
        label: isArabic ? city.nameAr : city.name,
      })),
    ],
    [citiesQuery.data, isArabic, t],
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PreferencesForm>({
    defaultValues: {
      theme: preferences.theme,
      language: preferences.language,
      currency: preferences.currency,
      defaultListingType: preferences.defaultListingType,
      preferredCity: preferences.preferredCity,
      emailNotifications: preferences.emailNotifications,
      priceAlerts: preferences.priceAlerts,
      weeklyDigest: preferences.weeklyDigest,
    },
  });

  const onSubmit = handleSubmit((values) => {
    dispatch(patchPreferences(values));
    toast.success(t('dashboard.preferencesSaved'));
  });

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6">
      <section className="surface-card p-6">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Globe2 className="h-4 w-4 text-accent-600" aria-hidden="true" />
            {t('dashboard.preferencesTitle')}
          </h2>
          <p className="mt-1 text-sm text-subtle">{t('dashboard.preferencesSubtitle')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('nav.theme')} htmlFor="pref-theme">
            <Select
              id="pref-theme"
              options={[
                { value: 'light', label: t('nav.light') },
                { value: 'dark', label: t('nav.dark') },
              ]}
              {...register('theme')}
            />
          </Field>

          <Field label={t('nav.language')} htmlFor="pref-language">
            <Select
              id="pref-language"
              options={SUPPORTED_LANGUAGES.map((code) => ({
                value: code,
                label: LANGUAGE_META[code].nativeLabel,
              }))}
              {...register('language')}
            />
          </Field>

          <Field label={t('nav.currency')} htmlFor="pref-currency">
            <Select
              id="pref-currency"
              options={CURRENCY_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              {...register('currency')}
            />
          </Field>

          <Field label={t('dashboard.defaultListingType')} htmlFor="pref-listing-type">
            <Select
              id="pref-listing-type"
              options={[
                { value: 'all', label: t('common.all') },
                { value: 'sale', label: t('explore.buy') },
                { value: 'rent', label: t('explore.rent') },
              ]}
              {...register('defaultListingType')}
            />
          </Field>

          <Field label={t('dashboard.preferredCity')} htmlFor="pref-city" className="sm:col-span-2">
            <Select
              id="pref-city"
              options={cityOptions}
              disabled={citiesQuery.isLoading}
              {...register('preferredCity')}
            />
          </Field>
        </div>
      </section>

      <section className="surface-card p-6">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-4 w-4 text-accent-600" aria-hidden="true" />
            {t('dashboard.emailNotifications')}
          </h2>
        </div>

        <div className="space-y-5">
          <Switch
            id="pref-email"
            label={t('dashboard.emailNotifications')}
            description={t('dashboard.emailNotificationsHint')}
            {...register('emailNotifications')}
          />
          <Switch
            id="pref-price-alerts"
            label={t('dashboard.priceAlerts')}
            description={t('dashboard.priceAlertsHint')}
            {...register('priceAlerts')}
          />
          <Switch
            id="pref-digest"
            label={t('dashboard.weeklyDigest')}
            description={t('dashboard.weeklyDigestHint')}
            {...register('weeklyDigest')}
          />
        </div>
      </section>

      <Button
        type="submit"
        isLoading={isSubmitting}
        loadingLabel={t('common.loading')}
        leftIcon={<Save className="h-4 w-4" aria-hidden="true" />}
      >
        {t('common.saveChanges')}
      </Button>
    </form>
  );
}
