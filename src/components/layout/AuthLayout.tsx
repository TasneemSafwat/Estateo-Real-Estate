import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { PHOTOS } from '@/utils/images';
import { APP, ROUTES } from '@/utils/constants';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { Logo } from './Logo';

/**
 * Split-screen authentication shell: brand storytelling on one side, the
 * focused form on the other. Collapses to a single column on small screens.
 */
export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <ScrollToTop />

      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src={PHOTOS.auth}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/92 via-brand-950/70 to-brand-950/45" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
          <Logo inverted />
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold leading-tight text-white xl:text-4xl">
              {t('home.heroTitle')}
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/75">
              {APP.description}
            </p>
          </div>
        </div>
      </aside>

      <div className="flex flex-col bg-canvas">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link to={ROUTES.home} className="lg:hidden">
            <Logo />
          </Link>
          <Link
            to={ROUTES.home}
            className="ms-auto inline-flex items-center gap-2 text-sm font-medium text-subtle transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t('common.back')}
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
