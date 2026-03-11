import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@widgets';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { APP_ROUTES } from '@shared/config/routes';
import { Spinner } from '@shared/ui/primitives';

const LandingPage = React.lazy(() =>
  import('@pages/landing/LandingPage').then(module => ({ default: module.LandingPage }))
);

const LoginPage = React.lazy(() =>
  import('@pages/login/LoginPage').then(module => ({ default: module.LoginPage }))
);

const DashboardPage = React.lazy(() =>
  import('@pages/dashboard/DashboardPage').then(module => ({ default: module.DashboardPage }))
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
          {/* Landing — public, standalone layout */}
          <Route path={APP_ROUTES.LANDING} element={<LandingPage />} />

          {/* Public Layer — auth pages */}
          <Route element={<PublicRoute />}>
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
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