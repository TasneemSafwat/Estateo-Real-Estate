import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

export interface ProtectedRouteProps {
  /** Restrict the subtree to administrators. */
  adminOnly?: boolean;
}

/**
 * Route guard for authenticated areas. Unauthenticated visitors are sent to the
 * sign-in page with the attempted location so they can be returned afterwards.
 */
export function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}

/** Keeps signed-in users away from the authentication screens. */
export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }
  return <Outlet />;
}
