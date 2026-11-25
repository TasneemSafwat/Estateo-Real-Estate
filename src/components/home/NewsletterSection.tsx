import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Mail, Send } from 'lucide-react';
import { Container, Section } from '@/components/common/Section';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PHOTOS } from '@/utils/images';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Newsletter capture with client-side validation and an inline success state. */
export function NewsletterSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(t('home.newsletterError'));
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <Section id="newsletter" spacing="lg">
      <Container>
        <div className="relative isolate overflow-hidden rounded-4xl bg-brand-900 px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
          <img
            src={PHOTOS.newsletter}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/92 via-brand-900/85 to-brand-900/70 rtl:bg-gradient-to-l" />

          <div className="max-w-xl">
            <h2 className="text-2xl leading-tight text-white sm:text-[2rem]">
              {t('home.newsletterTitle')}
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/72">
              {t('home.newsletterSubtitle')}
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3.5 text-sm font-medium text-emerald-50"
                role="status"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                {t('home.newsletterSuccess')}
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <label htmlFor="newsletter-email" className="sr-only">
                      {t('auth.email')}
                    </label>
                    <Input
                      id="newsletter-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError(null);
                      }}
                      placeholder={t('home.newsletterPlaceholder')}
                      startIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
                      invalid={Boolean(error)}
                      className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/50 hover:border-white/35 focus:ring-white/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    rightIcon={<Send className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />}
                  >
                    {t('home.newsletterCta')}
                  </Button>
                </div>
                {error && (
                  <p role="alert" className="mt-2.5 text-xs font-medium text-red-300">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
