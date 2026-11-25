import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Home } from 'lucide-react';
import { Button, buttonStyles } from '@/components/common/Button';
import { Container } from '@/components/common/Section';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/utils/constants';

export default function NotFoundPage() {
  const { t } = useTranslation();
  useDocumentTitle({ title: t('notFound.title') });

  return (
    <Container className="flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-800/6 text-accent-600 dark:bg-white/8">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-accent-600">404</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{t('notFound.title')}</h1>
      <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-subtle">
        {t('notFound.body')}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to={ROUTES.home} className={buttonStyles({ variant: 'primary', size: 'lg' })}>
          <Home className="h-4 w-4" aria-hidden="true" />
          {t('notFound.cta')}
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.history.back()}
        >
          {t('common.back')}
        </Button>
      </div>
    </Container>
  );
}
