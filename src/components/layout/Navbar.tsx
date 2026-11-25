import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GitCompareArrows, Heart, Menu } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useFavorites } from '@/hooks/useFavorites';
import { useComparison } from '@/hooks/useComparison';
import { NAV_LINKS, ROUTES } from '@/utils/constants';
import { Logo } from './Logo';
import { PreferencesMenu } from './PreferencesMenu';
import { UserMenu } from './UserMenu';
import { MobileNav } from './MobileNav';

/** Small pill that surfaces the favourites / comparison counters. */
function NavCounter({
  to,
  label,
  count,
  inverted,
  children,
}: {
  to: string;
  label: string;
  count: number;
  inverted: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors',
        inverted
          ? 'text-white hover:bg-white/12'
          : 'text-ink/80 hover:bg-brand-800/6 hover:text-ink dark:hover:bg-white/8',
      )}
    >
      {children}
      {count > 0 && (
        <span className="absolute -end-0.5 -top-0.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-accent-500 px-1 text-[0.625rem] font-bold leading-none text-brand-900">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}

export interface NavbarProps {
  /** Force a page to render the solid bar (e.g. immersive pages without a hero). */
  solid?: boolean;
}

/**
 * Primary site navigation. Sits transparently over the home hero and turns into
 * a frosted, elevated bar once the user scrolls or leaves the landing page.
 */
export function Navbar({ solid = false }: NavbarProps) {
  const { t } = useTranslation();
  const { isScrolled } = useScrollPosition(28);
  const location = useLocation();
  const { count: favoritesCount } = useFavorites();
  const { count: comparisonCount } = useComparison();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === ROUTES.home;
  const transparent = !solid && isHome && !isScrolled;

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[80] transition-[background-color,box-shadow,border-color] duration-300 ease-smooth',
          transparent
            ? 'border-b border-transparent bg-transparent'
            : 'glass border-b border-line shadow-[0_1px_0_rgba(14, 43, 49,0.04)]',
        )}
      >
        <div className="container flex h-[4.5rem] items-center gap-3 lg:h-20">
          <Link to={ROUTES.home} aria-label={t('nav.home')} className="shrink-0">
            <Logo inverted={transparent} />
          </Link>

          <nav
            aria-label={t('nav.menu')}
            className="ms-4 hidden items-center gap-0.5 lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === ROUTES.home}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                    transparent
                      ? 'text-white/85 hover:bg-white/10 hover:text-white'
                      : 'text-ink/75 hover:bg-brand-800/6 hover:text-ink dark:hover:bg-white/8',
                    isActive &&
                      link.to === ROUTES.home &&
                      (transparent ? 'text-white' : 'text-ink'),
                  )
                }
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-1">
            <div className="hidden items-center gap-1 sm:flex">
              <NavCounter
                to={ROUTES.dashboardSaved}
                label={t('nav.saved')}
                count={favoritesCount}
                inverted={transparent}
              >
                <Heart className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
              </NavCounter>
              <NavCounter
                to={ROUTES.compare}
                label={t('nav.compare')}
                count={comparisonCount}
                inverted={transparent}
              >
                <GitCompareArrows className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
              </NavCounter>
            </div>

            <div
              className={cn(
                'hidden lg:block',
                transparent &&
                  '[&_button]:text-white/85 [&_button:hover]:bg-white/12 [&_button:hover]:text-white',
              )}
            >
              <PreferencesMenu />
            </div>

            <UserMenu inverted={transparent} />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={menuOpen}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden',
                transparent
                  ? 'text-white hover:bg-white/12'
                  : 'text-ink hover:bg-brand-800/6 dark:hover:bg-white/8',
              )}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {transparent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-brand-950/55 to-transparent"
            aria-hidden="true"
          />
        )}
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
