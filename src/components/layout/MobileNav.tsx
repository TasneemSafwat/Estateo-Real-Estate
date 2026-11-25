import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { GitCompareArrows, Heart, LogOut, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useComparison } from '@/hooks/useComparison';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Logo } from './Logo';
import { NAV_LINKS, ROUTES } from '@/utils/constants';
import { LANGUAGE_META, SUPPORTED_LANGUAGES } from '@/i18n';
import type { Language } from '@/types';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors',
    isActive ? 'bg-brand-800 text-white' : 'text-ink hover:bg-brand-800/6 dark:hover:bg-white/8',
  );

/** Full-height mobile navigation drawer. */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count: favoritesCount } = useFavorites();
  const { count: comparisonCount } = useComparison();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-brand-950/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col border-s border-line bg-panel shadow-lift rtl:left-0 rtl:right-auto"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label={t('nav.closeMenu')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-subtle transition-colors hover:bg-brand-800/8 hover:text-ink dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <nav className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
                    {t(link.labelKey)}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => go(ROUTES.dashboardSaved)}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-canvas/60 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand-800/25"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-accent-600" aria-hidden="true" />
                    {t('nav.saved')}
                  </span>
                  <span className="text-xs text-subtle">{favoritesCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(ROUTES.compare)}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-canvas/60 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand-800/25"
                >
                  <span className="flex items-center gap-2">
                    <GitCompareArrows className="h-4 w-4 text-accent-600" aria-hidden="true" />
                    {t('nav.compare')}
                  </span>
                  <span className="text-xs text-subtle">{comparisonCount}</span>
                </button>
              </div>

              <div className="mt-5 space-y-3 rounded-2xl border border-line bg-canvas/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{t('nav.language')}</span>
                  <div className="flex gap-1 rounded-lg bg-brand-800/6 p-1 dark:bg-white/8">
                    {SUPPORTED_LANGUAGES.map((code: Language) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setLanguage(code)}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                          language === code ? 'bg-panel text-ink shadow-soft' : 'text-subtle',
                        )}
                      >
                        {LANGUAGE_META[code].nativeLabel}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{t('nav.theme')}</span>
                  <Button variant="subtle" size="sm" onClick={toggleTheme}>
                    {theme === 'dark' ? t('nav.light') : t('nav.dark')}
                  </Button>
                </div>
              </div>
            </div>

            <footer className="space-y-2.5 border-t border-line p-4">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                      onClick={() => go(ROUTES.admin)}
                    >
                      {t('nav.admin')}
                    </Button>
                  )}
                  <Button variant="primary" fullWidth onClick={() => go(ROUTES.dashboard)}>
                    {user ? t('dashboard.greeting', { name: user.name.split(' ')[0] }) : t('nav.dashboard')}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => {
                      logout();
                      toast.info(t('auth.logoutSuccess'));
                      onClose();
                      navigate(ROUTES.home);
                    }}
                  >
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" fullWidth onClick={() => go(ROUTES.login)}>
                    {t('nav.login')}
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => go(ROUTES.register)}>
                    {t('nav.register')}
                  </Button>
                </>
              )}
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
