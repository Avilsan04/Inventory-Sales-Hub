import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@widgets';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { APP_ROUTES } from '@shared/config/routes';
import { Spinner } from '@shared/ui/primitives';
import { setupHttpEvents } from '@core/http';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';

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
          <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
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
              <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />
            </Route>
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to={APP_ROUTES.LANDING} replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}