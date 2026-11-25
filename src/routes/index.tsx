import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  AdminLayout,
  AuthLayout,
  DashboardLayout,
  RootLayout,
} from '@/components/layout';
import { Spinner } from '@/components/common/Feedback';
import { ROUTES } from '@/utils/constants';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';

/* Route-level code splitting — each page ships as its own chunk. */
const HomePage = lazy(() => import('@/pages/HomePage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const PropertyDetailsPage = lazy(() => import('@/pages/PropertyDetailsPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const ReelsPage = lazy(() => import('@/pages/ReelsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const DashboardOverviewPage = lazy(() => import('@/pages/dashboard/DashboardOverviewPage'));
const SavedPropertiesPage = lazy(() => import('@/pages/dashboard/SavedPropertiesPage'));
const RecentlyViewedPage = lazy(() => import('@/pages/dashboard/RecentlyViewedPage'));
const DashboardComparePage = lazy(() => import('@/pages/dashboard/DashboardComparePage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));
const PreferencesPage = lazy(() => import('@/pages/dashboard/PreferencesPage'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const ManagePropertiesPage = lazy(() => import('@/pages/admin/ManagePropertiesPage'));
const PropertyWizardPage = lazy(() => import('@/pages/admin/PropertyWizardPage'));
const ManageUsersPage = lazy(() => import('@/pages/admin/ManageUsersPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <Spinner className="h-6 w-6" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}

/**
 * Central route table. Public marketing pages share the `RootLayout`; the
 * authentication screens render their own split layout, while the dashboard
 * and admin areas mount workspace shells behind `ProtectedRoute` guards.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Immersive video-commerce feed (own full-screen shell) */}
        <Route path={ROUTES.reels} element={<ReelsPage />} />

        {/* Public marketing + catalogue */}
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.explore} element={<ExplorePage />} />
          <Route path={ROUTES.property()} element={<PropertyDetailsPage />} />
          <Route path={ROUTES.compare} element={<ComparePage />} />
          <Route path={ROUTES.notFound} element={<NotFoundPage />} />
        </Route>

        {/* Authentication (guests only) */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<RegisterPage />} />
            <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/* Buyer dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.dashboard} element={<DashboardOverviewPage />} />
            <Route path={ROUTES.dashboardSaved} element={<SavedPropertiesPage />} />
            <Route path={ROUTES.dashboardRecent} element={<RecentlyViewedPage />} />
            <Route path={ROUTES.dashboardCompare} element={<DashboardComparePage />} />
            <Route path={ROUTES.dashboardProfile} element={<ProfilePage />} />
            <Route path={ROUTES.dashboardPreferences} element={<PreferencesPage />} />
          </Route>
        </Route>

        {/* Admin console */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.admin} element={<AdminOverviewPage />} />
            <Route path={ROUTES.adminProperties} element={<ManagePropertiesPage />} />
            <Route path={ROUTES.adminPropertyNew} element={<PropertyWizardPage />} />
            <Route path={ROUTES.adminPropertyEdit()} element={<PropertyWizardPage />} />
            <Route path={ROUTES.adminUsers} element={<ManageUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
