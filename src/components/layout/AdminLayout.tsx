import { useTranslation } from 'react-i18next';
import { Building2, LayoutDashboard, PlusCircle, Users } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { WorkspaceShell, type WorkspaceNavItem } from './WorkspaceShell';

/** Admin workspace shell: catalogue and user management. */
export function AdminLayout() {
  const { t } = useTranslation();

  const navItems: WorkspaceNavItem[] = [
    {
      to: ROUTES.admin,
      label: t('dashboard.overview'),
      icon: <LayoutDashboard className="h-4 w-4" />,
      end: true,
    },
    {
      to: ROUTES.adminProperties,
      label: t('admin.manageProperties'),
      icon: <Building2 className="h-4 w-4" />,
      end: true,
    },
    {
      to: ROUTES.adminPropertyNew,
      label: t('admin.addProperty'),
      icon: <PlusCircle className="h-4 w-4" />,
      end: true,
    },
    {
      to: ROUTES.adminUsers,
      label: t('admin.manageUsers'),
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <WorkspaceShell
      navItems={navItems}
      eyebrow={t('nav.admin')}
      title={t('admin.title')}
      subtitle={t('admin.subtitle')}
    />
  );
}
