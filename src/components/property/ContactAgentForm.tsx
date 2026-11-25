import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CheckCircle2, Send } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/services/api/client';
import { sendPropertyInquiry } from '@/services/propertyService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Field } from '@/components/common/Field';
import { Input, Textarea } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export interface ContactAgentFormProps {
  propertyId: string;
  agentName?: string;
  className?: string;
}

type FormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

/**
 * "Request a viewing" form. Validated with Zod, submitted through a mocked
 * service call, with success and error feedback surfaced inline and via toast.
 */
export function ContactAgentForm({ propertyId, agentName, className }: ContactAgentFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('errors.minLength', { count: 2 })),
        email: z.string().email(t('errors.email')),
        phone: z.string().min(6, t('errors.minLength', { count: 6 })),
        message: z.string().min(10, t('errors.minLength', { count: 10 })),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: '',
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => sendPropertyInquiry({ propertyId, ...values }),
    onSuccess: () => {
      setSent(true);
      toast.success(t('details.requestSent'));
    },
    onError: (error) => {
      toast.error(t('details.requestError'), getErrorMessage(error));
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  if (sent) {
    return (
      <div className={cn('surface-card flex flex-col items-center p-8 text-center', className)}>
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="text-base font-semibold text-ink">{t('details.requestSent')}</h3>
        <p className="mt-1.5 max-w-sm text-sm text-subtle">
          {t('details.contactSubtitle')}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(false);
            reset({ name: user?.name ?? '', email: user?.email ?? '', phone: '', message: '' });
          }}
        >
          {t('details.contactAgent')}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn('surface-card p-6', className)}
      aria-label={t('details.contactTitle')}
    >
      <h2 className="text-lg font-semibold">{t('details.contactTitle')}</h2>
      <p className="mt-1 text-sm text-subtle">
        {agentName ? `${t('details.agent')}: ${agentName}` : t('details.contactSubtitle')}
      </p>

      <div className="mt-5 space-y-4">
        <Field label={t('details.yourName')} htmlFor={`contact-name-${propertyId}`} error={errors.name?.message} required>
          <Input
            id={`contact-name-${propertyId}`}
            autoComplete="name"
            invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('details.yourEmail')} htmlFor={`contact-email-${propertyId}`} error={errors.email?.message} required>
            <Input
              id={`contact-email-${propertyId}`}
              type="email"
              autoComplete="email"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>
          <Field label={t('details.yourPhone')} htmlFor={`contact-phone-${propertyId}`} error={errors.phone?.message} required>
            <Input
              id={`contact-phone-${propertyId}`}
              type="tel"
              autoComplete="tel"
              invalid={Boolean(errors.phone)}
              {...register('phone')}
            />
          </Field>
        </div>

        <Field label={t('details.message')} htmlFor={`contact-message-${propertyId}`} error={errors.message?.message} required>
          <Textarea
            id={`contact-message-${propertyId}`}
            rows={4}
            placeholder={t('details.messagePlaceholder')}
            invalid={Boolean(errors.message)}
            {...register('message')}
          />
        </Field>
      </div>

      <Button
        type="submit"
        fullWidth
        className="mt-5"
        isLoading={mutation.isPending}
        leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
      >
        {t('details.sendRequest')}
      </Button>
    </form>
  );
}
