import { useTranslation } from 'react-i18next';
import {
  GitCompareArrows,
  Heart,
  History,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useComparison } from '@/hooks/useComparison';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ROUTES } from '@/utils/constants';
import { WorkspaceShell, type WorkspaceNavItem } from './WorkspaceShell';

/** Authenticated buyer workspace shell with sidebar navigation. */
export function DashboardLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { count: favoritesCount } = useFavorites();
  const { count: comparisonCount } = useComparison();
  const { count: recentCount } = useRecentlyViewed();

  const navItems: WorkspaceNavItem[] = [
    {
      to: ROUTES.dashboard,
      label: t('dashboard.overview'),
      icon: <LayoutDashboard className="h-4 w-4" />,
      end: true,
    },
    {
      to: ROUTES.dashboardSaved,
      label: t('dashboard.savedProperties'),
      icon: <Heart className="h-4 w-4" />,
      badge: favoritesCount,
    },
    {
      to: ROUTES.dashboardRecent,
      label: t('dashboard.recentlyViewed'),
      icon: <History className="h-4 w-4" />,
      badge: recentCount,
    },
    {
      to: ROUTES.dashboardCompare,
      label: t('dashboard.comparison'),
      icon: <GitCompareArrows className="h-4 w-4" />,
      badge: comparisonCount,
    },
    {
      to: ROUTES.dashboardProfile,
      label: t('dashboard.profile'),
      icon: <User className="h-4 w-4" />,
    },
    {
      to: ROUTES.dashboardPreferences,
      label: t('dashboard.preferences'),
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <WorkspaceShell
      navItems={navItems}
      eyebrow={t('dashboard.title')}
      title={user ? t('dashboard.greeting', { name: user.name.split(' ')[0] }) : t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
    />
  );
}
