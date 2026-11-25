import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Container } from '@/components/common/Section';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { Navbar } from './Navbar';

export interface WorkspaceNavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  badge?: number;
}

export interface WorkspaceShellProps {
  navItems: WorkspaceNavItem[];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-800 text-white shadow-soft'
      : 'text-ink/75 hover:bg-brand-800/6 hover:text-ink dark:hover:bg-white/8',
  );

/**
 * Shared shell for the authenticated dashboard and admin areas: an app-style
 * sidebar on desktop that collapses into a scrollable tab rail on mobile.
 */
export function WorkspaceShell({
  navItems,
  eyebrow,
  title,
  subtitle,
  actions,
}: WorkspaceShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <ScrollToTop />
      <Navbar solid />
      <Container className="flex-1 py-8 lg:py-10">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && <p className="section-eyebrow mb-2.5">{eyebrow}</p>}
            <h1 className="text-2xl leading-tight sm:text-[2rem]">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-subtle">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
        </header>

        <div className="lg:grid lg:grid-cols-[15.5rem_1fr] lg:gap-8">
          <aside className="mb-6 lg:mb-0">
            <nav
              aria-label={title}
              className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      linkClass({ isActive }),
                      'shrink-0 whitespace-nowrap lg:w-full',
                    )
                  }
                >
                  <span className="flex h-4 w-4 items-center justify-center" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-2xs font-semibold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </Container>
    </div>
  );
}
