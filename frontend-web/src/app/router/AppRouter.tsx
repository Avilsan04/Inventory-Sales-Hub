import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@widgets';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { APP_ROUTES } from '@shared/config/routes';
import { Spinner } from '@shared/ui/primitives';

const DashboardPage = React.lazy(() =>
  import('@pages/dashboard/DashboardPage').then(module => ({ default: module.DashboardPage }))
);

const LoginPage = React.lazy(() =>
  import('@pages/login/LoginPage').then(module => ({ default: module.LoginPage }))
);

export function AppRouter(): React.ReactElement {
  return (
    <BrowserRouter>
      <React.Suspense
        fallback={
          <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Public Layer */}
          <Route element={<PublicRoute />}>
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

          {/* Protected Layer */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Explicit mapping for /dashboard */}
              <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />

              {/* Root redirect: If user goes to '/', send them to dashboard */}
              <Route path={APP_ROUTES.ROOT} element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
            </Route>
          </Route>

          {/* Fallback Catch-all: Send unknown URLs to ROOT (which then evaluates auth state) */}
          <Route path="*" element={<Navigate to={APP_ROUTES.ROOT} replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}