import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ImagePlus,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  CurrencyCode,
  ListingType,
  Property,
  PropertyDraft,
  PropertyStatus,
  PropertyType,
} from '@/types';
import {
  createProperty,
  fetchCities,
  fetchProperty,
  queryKeys,
  updateProperty,
} from '@/services/propertyService';
import { AMENITIES } from '@/services/mock/amenities.data';
import { CITY_MAP } from '@/services/mock/cities.data';
import { AGENTS } from '@/services/mock/agents.data';
import { useToast } from '@/hooks/useToast';
import { useCurrency } from '@/hooks/useCurrency';
import { readStorage, removeStorage, writeStorage, STORAGE_KEYS } from '@/utils/storage';
import { cn } from '@/utils/cn';
import { CURRENCY_OPTIONS, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_LABELS_AR, ROUTES } from '@/utils/constants';
import { Button, buttonStyles } from '@/components/common/Button';
import { Field } from '@/components/common/Field';
import { Input, Textarea } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Switch } from '@/components/common/Checkbox';
import { Stepper } from '@/components/common/Stepper';
import { Skeleton } from '@/components/common/Skeleton';
import { Badge } from '@/components/common/Badge';
import { ErrorState } from '@/components/common/Feedback';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

const PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'house',
  'villa',
  'penthouse',
  'studio',
  'townhouse',
  'office',
  'land',
];

const CURRENCY_CODES: CurrencyCode[] = ['USD', 'AED', 'SAR', 'EGP', 'EUR'];

interface WizardValues {
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  address: string;
  city: string;
  district: string;
  country: string;
  latitude: string;
  longitude: string;
  price: string;
  currency: CurrencyCode;
  area: string;
  bedrooms: string;
  bathrooms: string;
  garages: string;
  floors: string;
  yearBuilt: string;
  furnished: boolean;
  amenities: string[];
  images: string[];
}

const EMPTY_VALUES: WizardValues = {
  title: '',
  description: '',
  type: 'apartment',
  listingType: 'sale',
  address: '',
  city: '',
  district: '',
  country: '',
  latitude: '',
  longitude: '',
  price: '',
  currency: 'USD',
  area: '',
  bedrooms: '2',
  bathrooms: '1',
  garages: '1',
  floors: '1',
  yearBuilt: String(new Date().getFullYear()),
  furnished: false,
  amenities: [],
  images: [],
};

type StepField = keyof WizardValues;

const STEP_FIELDS: StepField[][] = [
  ['title', 'description', 'type', 'listingType'],
  ['address', 'city', 'district', 'country'],
  ['price', 'currency', 'area', 'bedrooms', 'bathrooms', 'garages', 'floors', 'yearBuilt', 'furnished'],
  ['amenities'],
  ['images'],
  [],
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

function toFormValues(property: Property): WizardValues {
  return {
    title: property.title,
    description: property.description,
    type: property.type,
    listingType: property.listingType,
    address: property.location.address,
    city: property.location.city,
    district: property.location.district,
    country: property.location.country,
    latitude: String(property.location.coordinates.lat),
    longitude: String(property.location.coordinates.lng),
    price: String(property.price),
    currency: property.currency,
    area: String(property.area),
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    garages: String(property.garages),
    floors: String(property.floors),
    yearBuilt: String(property.yearBuilt),
    furnished: property.furnished,
    amenities: [...property.amenities],
    images: [...property.images],
  };
}

function buildDraft(
  values: WizardValues,
  meta: { status: PropertyStatus; featured: boolean; agentId: string },
): PropertyDraft {
  const cityCoordinates = CITY_MAP[values.city]?.coordinates;
  const lat = values.latitude.trim() === '' ? NaN : Number(values.latitude);
  const lng = values.longitude.trim() === '' ? NaN : Number(values.longitude);

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    type: values.type,
    listingType: values.listingType,
    status: meta.status,
    price: Number(values.price),
    currency: values.currency,
    pricePeriod: values.listingType === 'rent' ? 'month' : 'total',
    area: Number(values.area),
    bedrooms: Number(values.bedrooms),
    bathrooms: Number(values.bathrooms),
    garages: Number(values.garages),
    yearBuilt: Number(values.yearBuilt),
    floors: Number(values.floors),
    furnished: values.furnished,
    amenities: values.amenities,
    location: {
      address: values.address.trim(),
      city: values.city,
      district: values.district.trim(),
      country: values.country.trim(),
      coordinates: {
        lat: Number.isFinite(lat) ? lat : (cityCoordinates?.lat ?? 0),
        lng: Number.isFinite(lng) ? lng : (cityCoordinates?.lng ?? 0),
      },
    },
    images: values.images,
    coverImage: values.images[0] ?? '',
    agentId: meta.agentId,
    featured: meta.featured,
  };
}

/** Six-step listing wizard shared by the create and edit admin routes. */
export default function PropertyWizardPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const toast = useToast();
  const queryClient = useQueryClient();
  const { priceOf } = useCurrency();

  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [published, setPublished] = useState<Property | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef<Property | null>(null);
  const prefilledRef = useRef(false);

  const steps = useMemo(
    () => [
      { id: 'basic', label: t('addProperty.steps.basic') },
      { id: 'location', label: t('addProperty.steps.location') },
      { id: 'pricing', label: t('addProperty.steps.pricing') },
      { id: 'amenities', label: t('addProperty.steps.amenities') },
      { id: 'images', label: t('addProperty.steps.images') },
      { id: 'review', label: t('addProperty.steps.review') },
    ],
    [t],
  );

  const schema = useMemo(() => {
    const requiredNumber = (message: string) =>
      z
        .string()
        .min(1, t('errors.required'))
        .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, message);
    const wholeNumber = (min: number) =>
      z
        .string()
        .min(1, t('errors.required'))
        .refine((value) => Number.isInteger(Number(value)) && Number(value) >= min, t('errors.integer'));

    return z.object({
      title: z.string().min(8, t('errors.minLength', { count: 8 })),
      description: z.string().min(30, t('errors.minLength', { count: 30 })),
      type: z.enum(PROPERTY_TYPES as [PropertyType, ...PropertyType[]]),
      listingType: z.enum(['sale', 'rent']),
      address: z.string().min(4, t('errors.minLength', { count: 4 })),
      city: z.string().min(1, t('errors.required')),
      district: z.string().min(2, t('errors.minLength', { count: 2 })),
      country: z.string().min(2, t('errors.minLength', { count: 2 })),
      latitude: z.string(),
      longitude: z.string(),
      price: requiredNumber(t('errors.positive')),
      currency: z.enum(CURRENCY_CODES as [CurrencyCode, ...CurrencyCode[]]),
      area: requiredNumber(t('errors.positive')),
      bedrooms: wholeNumber(0),
      bathrooms: wholeNumber(0),
      garages: wholeNumber(0),
      floors: wholeNumber(1),
      yearBuilt: z
        .string()
        .min(1, t('errors.required'))
        .refine((value) => {
          const year = Number(value);
          return Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
        }, t('errors.integer')),
      furnished: z.boolean(),
      amenities: z.array(z.string()).min(2, t('addProperty.missingAmenities')),
      images: z.array(z.string()).min(1, t('addProperty.missingImages')),
    });
  }, [t]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = useForm<WizardValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
    mode: 'onTouched',
  });

  const amenities = watch('amenities');
  const images = watch('images');
  const cityValue = watch('city');
  const listingTypeValue = watch('listingType');

  const citiesQuery = useQuery({
    queryKey: queryKeys.catalog.cities,
    queryFn: ({ signal }) => fetchCities(signal),
    staleTime: 5 * 60 * 1000,
  });

  const propertyQuery = useQuery({
    queryKey: queryKeys.properties.detail(id ?? ''),
    queryFn: ({ signal }) => fetchProperty(id as string, signal),
    enabled: isEdit,
  });

  /* Restore a locally saved draft when creating a brand new listing. */
  useEffect(() => {
    if (isEdit) return;
    const draft = readStorage<Partial<WizardValues> | null>(STORAGE_KEYS.propertyDraft, null);
    if (draft && typeof draft === 'object' && Object.keys(draft).length > 0) {
      reset({ ...EMPTY_VALUES, ...draft });
      toast.info(t('addProperty.draftSaved'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Prefill the form once when editing an existing listing. */
  useEffect(() => {
    if (!isEdit || !propertyQuery.data || prefilledRef.current) return;
    prefilledRef.current = true;
    loadedRef.current = propertyQuery.data;
    reset(toFormValues(propertyQuery.data));
  }, [isEdit, propertyQuery.data, reset]);

  const saveDraft = useCallback(() => {
    writeStorage(STORAGE_KEYS.propertyDraft, getValues());
  }, [getValues]);

  const publishMutation = useMutation({
    mutationFn: (values: WizardValues) => {
      const draft = buildDraft(values, {
        status: loadedRef.current?.status ?? 'active',
        featured: loadedRef.current?.featured ?? false,
        agentId: loadedRef.current?.agentId ?? AGENTS[0].id,
      });
      return isEdit && id ? updateProperty(id, draft) : createProperty(draft);
    },
    onSuccess: async (property) => {
      removeStorage(STORAGE_KEYS.propertyDraft);
      await queryClient.invalidateQueries({ queryKey: queryKeys.properties.root });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.activity });
      if (isEdit) {
        toast.success(t('admin.propertyUpdated'));
        navigate(ROUTES.adminProperties);
      } else {
        setPublished(property);
      }
    },
    onError: (error) => toast.fromError(error, t('addProperty.errorTitle')),
  });

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    const nextStep = Math.min(step + 1, steps.length - 1);
    setStep(nextStep);
    setMaxVisited((current) => Math.max(current, nextStep));
    saveDraft();
  };

  const handleBack = () => {
    saveDraft();
    setStep((current) => Math.max(0, current - 1));
  };

  const handlePublish = async () => {
    for (let index = 0; index < steps.length; index += 1) {
      const fields = STEP_FIELDS[index];
      if (fields.length > 0 && !(await trigger(fields))) {
        setStep(index);
        setMaxVisited((current) => Math.max(current, index));
        toast.error(t('addProperty.errorTitle'));
        return;
      }
    }
    publishMutation.mutate(getValues());
  };

  const toggleAmenity = (amenityId: string) => {
    const current = getValues('amenities');
    const next = current.includes(amenityId)
      ? current.filter((value) => value !== amenityId)
      : [...current, amenityId];
    setValue('amenities', next, { shouldValidate: true, shouldDirty: true });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const accepted: string[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES) {
        toast.error(t('addProperty.invalidImage'));
        continue;
      }
      accepted.push(await readFileAsDataUrl(file));
    }
    if (accepted.length > 0) {
      setValue('images', [...getValues('images'), ...accepted], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const removeImage = (index: number) => {
    setValue(
      'images',
      getValues('images').filter((_, itemIndex) => itemIndex !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const makeCover = (index: number) => {
    const current = getValues('images');
    const reordered = [current[index], ...current.filter((_, itemIndex) => itemIndex !== index)];
    setValue('images', reordered, { shouldDirty: true });
  };

  const handleAddAnother = () => {
    removeStorage(STORAGE_KEYS.propertyDraft);
    reset(EMPTY_VALUES);
    loadedRef.current = null;
    prefilledRef.current = false;
    setPublished(null);
    setStep(0);
    setMaxVisited(0);
  };

  const typeLabel = (value: PropertyType) =>
    isArabic ? PROPERTY_TYPE_LABELS_AR[value] : PROPERTY_TYPE_LABELS[value];

  if (published) {
    return (
      <div className="surface-card mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/14 text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-semibold text-ink">{t('addProperty.successTitle')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-subtle">
          {t('addProperty.successBody', { title: published.title })}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={ROUTES.property(published.id)} className={buttonStyles({ variant: 'primary' })}>
            {t('addProperty.viewProperty')}
          </Link>
          <Button variant="outline" onClick={handleAddAnother}>
            {t('addProperty.addAnother')}
          </Button>
        </div>
      </div>
    );
  }

  if (isEdit && propertyQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (isEdit && (propertyQuery.isError || !propertyQuery.data)) {
    return (
      <ErrorState
        title={t('details.notFoundTitle')}
        description={t('details.notFoundBody')}
        onRetry={() => void propertyQuery.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  return (
    <form
      className="space-y-7"
      onSubmit={handleSubmit(() => void handlePublish())}
      noValidate
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            {isEdit ? t('admin.editProperty') : t('addProperty.title')}
          </h2>
          <p className="mt-1 text-sm text-subtle">{t('addProperty.subtitle')}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            saveDraft();
            toast.success(t('addProperty.draftSavedToast'));
          }}
        >
          {t('addProperty.saveDraft')}
        </Button>
      </div>

      <Stepper
        steps={steps}
        current={step}
        furthest={maxVisited}
        onStepClick={(index) => index <= maxVisited && setStep(index)}
      />

      <p className="text-sm font-medium text-subtle">
        {t('addProperty.step', { current: step + 1, total: steps.length })}
      </p>

      <div className="surface-card p-6">
        {step === 0 && (
          <div className="space-y-5">
            <StepHeading title={t('addProperty.basicTitle')} subtitle={t('addProperty.basicSubtitle')} />
            <Field label={t('addProperty.titleField')} htmlFor="title" error={errors.title?.message} required>
              <Input
                id="title"
                placeholder={t('addProperty.titlePlaceholder')}
                invalid={Boolean(errors.title)}
                {...register('title')}
              />
            </Field>
            <Field
              label={t('addProperty.descriptionField')}
              htmlFor="description"
              error={errors.description?.message}
              required
            >
              <Textarea
                id="description"
                rows={5}
                placeholder={t('addProperty.descriptionPlaceholder')}
                invalid={Boolean(errors.description)}
                {...register('description')}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('addProperty.typeField')} htmlFor="type" error={errors.type?.message} required>
                <Select
                  id="type"
                  options={PROPERTY_TYPES.map((value) => ({ value, label: typeLabel(value) }))}
                  {...register('type')}
                />
              </Field>
              <Field
                label={t('addProperty.listingTypeField')}
                htmlFor="listingType"
                error={errors.listingType?.message}
                required
              >
                <Select
                  id="listingType"
                  options={[
                    { value: 'sale', label: t('addProperty.forSale') },
                    { value: 'rent', label: t('addProperty.forRent') },
                  ]}
                  {...register('listingType')}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <StepHeading title={t('addProperty.locationTitle')} subtitle={t('addProperty.locationSubtitle')} />
            <Field label={t('addProperty.addressField')} htmlFor="address" error={errors.address?.message} required>
              <Input id="address" invalid={Boolean(errors.address)} {...register('address')} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('addProperty.cityField')} htmlFor="city" error={errors.city?.message} required>
                <Select
                  id="city"
                  placeholder={t('addProperty.cityField')}
                  value={cityValue}
                  invalid={Boolean(errors.city)}
                  options={(citiesQuery.data ?? []).map((city) => ({
                    value: city.name,
                    label: isArabic ? city.nameAr : city.name,
                  }))}
                  onChange={(event) => {
                    const next = event.target.value;
                    setValue('city', next, { shouldValidate: true, shouldDirty: true });
                    const country = CITY_MAP[next]?.country;
                    if (country && !getValues('country')) {
                      setValue('country', country, { shouldValidate: true });
                    }
                  }}
                />
              </Field>
              <Field label={t('addProperty.districtField')} htmlFor="district" error={errors.district?.message} required>
                <Input id="district" invalid={Boolean(errors.district)} {...register('district')} />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t('addProperty.countryField')} htmlFor="country" error={errors.country?.message} required>
                <Input id="country" invalid={Boolean(errors.country)} {...register('country')} />
              </Field>
              <Field label={t('addProperty.latitude')} htmlFor="latitude" error={errors.latitude?.message}>
                <Input id="latitude" inputMode="decimal" placeholder="37.7749" {...register('latitude')} />
              </Field>
              <Field label={t('addProperty.longitude')} htmlFor="longitude" error={errors.longitude?.message}>
                <Input id="longitude" inputMode="decimal" placeholder="-122.4194" {...register('longitude')} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <StepHeading title={t('addProperty.pricingTitle')} subtitle={t('addProperty.pricingSubtitle')} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('addProperty.priceField')} htmlFor="price" error={errors.price?.message} required>
                <Input
                  id="price"
                  inputMode="numeric"
                  placeholder="750000"
                  invalid={Boolean(errors.price)}
                  {...register('price')}
                />
              </Field>
              <Field label={t('addProperty.currencyField')} htmlFor="currency" error={errors.currency?.message} required>
                <Select id="currency" options={CURRENCY_OPTIONS} {...register('currency')} />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t('addProperty.areaField')} htmlFor="area" error={errors.area?.message} required>
                <Input id="area" inputMode="numeric" invalid={Boolean(errors.area)} {...register('area')} />
              </Field>
              <Field label={t('addProperty.yearBuiltField')} htmlFor="yearBuilt" error={errors.yearBuilt?.message} required>
                <Input id="yearBuilt" inputMode="numeric" invalid={Boolean(errors.yearBuilt)} {...register('yearBuilt')} />
              </Field>
              <Field label={t('addProperty.floorsField')} htmlFor="floors" error={errors.floors?.message} required>
                <Input id="floors" inputMode="numeric" invalid={Boolean(errors.floors)} {...register('floors')} />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label={t('addProperty.bedroomsField')} htmlFor="bedrooms" error={errors.bedrooms?.message} required>
                <Input id="bedrooms" inputMode="numeric" invalid={Boolean(errors.bedrooms)} {...register('bedrooms')} />
              </Field>
              <Field label={t('addProperty.bathroomsField')} htmlFor="bathrooms" error={errors.bathrooms?.message} required>
                <Input id="bathrooms" inputMode="numeric" invalid={Boolean(errors.bathrooms)} {...register('bathrooms')} />
              </Field>
              <Field label={t('addProperty.garagesField')} htmlFor="garages" error={errors.garages?.message} required>
                <Input id="garages" inputMode="numeric" invalid={Boolean(errors.garages)} {...register('garages')} />
              </Field>
            </div>
            <Switch
              id="furnished"
              label={t('addProperty.furnishedField')}
              description={listingTypeValue === 'rent' ? t('explore.furnishedOnly') : t('details.furnished')}
              {...register('furnished')}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <StepHeading title={t('addProperty.amenitiesTitle')} subtitle={t('addProperty.amenitiesSubtitle')} />
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => {
                const selected = amenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.8125rem] font-medium transition-colors',
                      selected
                        ? 'border-brand-800 bg-brand-800 text-white'
                        : 'border-line bg-panel text-ink/80 hover:border-brand-800/30',
                    )}
                  >
                    {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
                    {isArabic ? amenity.labelAr : amenity.label}
                  </button>
                );
              })}
            </div>
            {errors.amenities && (
              <p role="alert" className="text-xs font-medium text-red-500">
                {errors.amenities.message}
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <StepHeading title={t('addProperty.imagesTitle')} subtitle={t('addProperty.imagesSubtitle')} />
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void handleFiles(event.dataTransfer.files);
              }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-panel/60 px-6 py-10 text-center transition-colors hover:border-brand-800/30"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-800/6 text-brand-700 dark:bg-white/8 dark:text-mist-100">
                  <Upload className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-ink">{t('addProperty.uploadHint')}</span>
                <span className="text-xs text-subtle">{t('addProperty.uploadFormats')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => void handleFiles(event.target.files)}
              />
            </div>

            {images.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((src, index) => (
                  <li key={`${src.slice(-24)}-${index}`} className="overflow-hidden rounded-2xl border border-line">
                    <ImageWithFallback
                      src={src}
                      alt={t('addProperty.imageAlt', { index: index + 1 })}
                      aspect="aspect-[4/3]"
                    >
                      {index === 0 && (
                        <Badge tone="brand" className="absolute start-2 top-2">
                          <Star className="h-3 w-3" aria-hidden="true" />
                          {t('addProperty.coverBadge')}
                        </Badge>
                      )}
                    </ImageWithFallback>
                    <div className="flex items-center justify-between gap-1.5 p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => makeCover(index)}
                      >
                        {t('addProperty.setAsCover')}
                      </Button>
                      <button
                        type="button"
                        aria-label={t('common.remove')}
                        onClick={() => removeImage(index)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {errors.images && (
              <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                {errors.images.message}
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <StepHeading title={t('addProperty.reviewTitle')} subtitle={t('addProperty.reviewSubtitle')} />
            <ReviewGrid
              rows={[
                [t('addProperty.titleField'), getValues('title')],
                [t('addProperty.typeField'), typeLabel(getValues('type'))],
                [
                  t('addProperty.listingTypeField'),
                  getValues('listingType') === 'rent' ? t('addProperty.forRent') : t('addProperty.forSale'),
                ],
                [
                  t('admin.city'),
                  `${getValues('city')} · ${getValues('district')}`,
                ],
                [
                  t('addProperty.priceField'),
                  priceOf({
                    price: Number(getValues('price')),
                    currency: getValues('currency'),
                    pricePeriod: getValues('listingType') === 'rent' ? 'month' : 'total',
                  } as Property),
                ],
                [t('addProperty.areaField'), `${getValues('area')} sq ft`],
                [t('addProperty.bedroomsField'), getValues('bedrooms')],
                [t('addProperty.bathroomsField'), getValues('bathrooms')],
                [t('addProperty.amenitiesTitle'), String(getValues('amenities').length)],
                [t('addProperty.imagesTitle'), String(getValues('images').length)],
              ]}
            />
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-panel/60 p-4">
              <p className="text-sm leading-relaxed text-subtle">{getValues('description')}</p>
            </div>
            {images[0] && (
              <ImageWithFallback
                src={images[0]}
                alt={t('addProperty.imageAlt', { index: 1 })}
                aspect="aspect-[16/9]"
                wrapperClassName="rounded-2xl"
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={step === 0}
          leftIcon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />}
        >
          {t('common.back')}
        </Button>

        {step < steps.length - 1 ? (
          <Button
            type="button"
            onClick={() => void handleNext()}
            rightIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />}
          >
            {t('common.next')}
          </Button>
        ) : (
          <Button
            type="submit"
            isLoading={publishMutation.isPending}
            loadingLabel={t('addProperty.publishing')}
          >
            {t('addProperty.publishCta')}
          </Button>
        )}
      </div>
    </form>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-subtle">{subtitle}</p>
    </div>
  );
}

function ReviewGrid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-2">
          <dt className="text-sm text-subtle">{label}</dt>
          <dd className="text-end text-sm font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
