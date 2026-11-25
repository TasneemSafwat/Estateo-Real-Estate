import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, LayoutDashboard, LogOut, Settings, ShieldCheck, User } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Dropdown } from '@/components/common/Dropdown';
import { Button, buttonStyles } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/utils/constants';

/**
 * Account entry point in the navigation bar.
 * Signed-out users get sign-in / sign-up calls to action.
 */
export function UserMenu({ inverted = false }: { inverted?: boolean }) {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Button
          variant={inverted ? 'ghost' : 'ghost'}
          size="sm"
          className={inverted ? 'text-white hover:bg-white/12 hover:text-white' : undefined}
          onClick={() => navigate(ROUTES.login)}
        >
          {t('nav.login')}
        </Button>
        <Button
          variant={inverted ? 'accent' : 'primary'}
          size="sm"
          onClick={() => navigate(ROUTES.register)}
        >
          {t('nav.register')}
        </Button>
      </div>
    );
  }

  return (
    <Dropdown
      ariaLabel={t('nav.account')}
      trigger={
        <button
          type="button"
          className={buttonStyles({
            variant: 'ghost',
            size: 'sm',
            className: 'gap-2 pe-3 ps-1.5',
          })}
          aria-label={t('nav.account')}
        >
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <span className="hidden max-w-28 truncate text-[0.8125rem] font-semibold sm:block">
            {user.name.split(' ')[0]}
          </span>
        </button>
      }
      items={[
        {
          id: 'dashboard',
          label: t('nav.dashboard'),
          icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
          onSelect: () => navigate(ROUTES.dashboard),
        },
        {
          id: 'saved',
          label: t('nav.saved'),
          icon: <Heart className="h-4 w-4" aria-hidden="true" />,
          onSelect: () => navigate(ROUTES.dashboardSaved),
        },
        ...(isAdmin
          ? [
              {
                id: 'admin',
                label: t('nav.admin'),
                icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
                onSelect: () => navigate(ROUTES.admin),
              },
            ]
          : []),
        {
          id: 'profile',
          label: t('nav.myProfile'),
          icon: <User className="h-4 w-4" aria-hidden="true" />,
          dividerBefore: true,
          onSelect: () => navigate(ROUTES.dashboardProfile),
        },
        {
          id: 'preferences',
          label: t('nav.preferences'),
          icon: <Settings className="h-4 w-4" aria-hidden="true" />,
          onSelect: () => navigate(ROUTES.dashboardPreferences),
        },
        {
          id: 'logout',
          label: t('nav.logout'),
          icon: <LogOut className="h-4 w-4" aria-hidden="true" />,
          danger: true,
          dividerBefore: true,
          onSelect: () => {
            logout();
            toast.info(t('auth.logoutSuccess'));
            navigate(ROUTES.home);
          },
        },
      ]}
    />
  );
}
