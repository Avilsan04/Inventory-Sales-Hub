import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@widgets';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { RoleRoute } from './guards/RoleRoute';
import { APP_ROUTES } from '@shared/config/routes';
import { Spinner } from '@shared/ui/primitives';
import { setupHttpEvents } from '@core/http';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

const LandingPage = React.lazy(() =>
  import('@pages/landing/LandingPage').then(module => ({ default: module.LandingPage }))
);

const LoginPage = React.lazy(() =>
  import('@pages/login/LoginPage').then(module => ({ default: module.LoginPage }))
);

const RegisterPage = React.lazy(() =>
  import('@pages/register/RegisterPage').then(module => ({ default: module.RegisterPage }))
);

const DashboardPage = React.lazy(() =>
  import('@pages/dashboard/DashboardPage').then(module => ({ default: module.DashboardPage }))
);

const InventoryPage = React.lazy(() =>
  import('@pages/inventory/InventoryPage').then(module => ({ default: module.InventoryPage }))
);

const ProductsPage = React.lazy(() =>
  import('@pages/products/ProductsPage').then(module => ({ default: module.ProductsPage }))
);

const SalesPage = React.lazy(() =>
  import('@pages/sales/SalesPage').then(module => ({ default: module.SalesPage }))
);

const CustomersPage = React.lazy(() =>
  import('@pages/customers/CustomersPage').then(module => ({ default: module.CustomersPage }))
);

const EmployeesPage = React.lazy(() =>
  import('@pages/employees/EmployeesPage').then(module => ({ default: module.EmployeesPage }))
);

const SuppliersPage = React.lazy(() =>
  import('@pages/suppliers/SuppliersPage').then(module => ({ default: module.SuppliersPage }))
);

const AnalyticsPage = React.lazy(() =>
  import('@pages/analytics/AnalyticsPage').then(module => ({ default: module.AnalyticsPage }))
);

const NotificationsPage = React.lazy(() =>
  import('@pages/notifications/NotificationsPage').then(module => ({ default: module.NotificationsPage }))
);

const ProfilePage = React.lazy(() =>
  import('@pages/profile/ProfilePage').then(module => ({ default: module.ProfilePage }))
);

const SettingsPage = React.lazy(() =>
  import('@pages/settings/SettingsPage').then(module => ({ default: module.SettingsPage }))
);

const NotFoundPage = React.lazy(() =>
  import('@pages/not-found/NotFoundPage').then(module => ({ default: module.NotFoundPage }))
);

/**
 * Registers global HTTP interceptors (e.g., 401 Unauthorized handling).
 * Uses the routing adapter to maintain architectural purity.
 */
function HttpInterceptorSetup(): null {
  const { navigateTo } = useRoutingAdapter();
  const navigateRef = React.useRef<typeof navigateTo>(navigateTo);

  React.useEffect(() => {
    navigateRef.current = navigateTo;
  }, [navigateTo]);

  React.useEffect(() => {
    // Architectural Requirement: Execute setup and retain the cleanup function
    const cleanup = setupHttpEvents(() => {
      navigateRef.current(APP_ROUTES.LOGIN, true);
    });

    // React enforces teardown on unmount, destroying stale interceptors
    return cleanup;
  }, []);

  return null;
}

export function AppRouter(): React.ReactElement {
  return (
    <BrowserRouter>
      <HttpInterceptorSetup />
      <React.Suspense
        fallback={
          <div className={styles.appLoading}>
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Landing — public, standalone layout */}
          <Route path={APP_ROUTES.LANDING} element={<LandingPage />} />

          {/* Public Layer — auth pages */}
          <Route element={<PublicRoute />}>
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
          </Route>

          {/* Protected Layer — application shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Customer-accessible routes */}
              <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={APP_ROUTES.SALES} element={<SalesPage />} />
              <Route path={APP_ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={APP_ROUTES.SETTINGS} element={<SettingsPage />} />

              {/* Admin/staff/test-only routes */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'staff', 'test']} />}>
                <Route path={APP_ROUTES.INVENTORY} element={<InventoryPage />} />
                <Route path={APP_ROUTES.PRODUCTS} element={<ProductsPage />} />
                <Route path={APP_ROUTES.CUSTOMERS} element={<CustomersPage />} />
                <Route path={APP_ROUTES.EMPLOYEES} element={<EmployeesPage />} />
                <Route path={APP_ROUTES.SUPPLIERS} element={<SuppliersPage />} />
                <Route path={APP_ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                <Route path={APP_ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}