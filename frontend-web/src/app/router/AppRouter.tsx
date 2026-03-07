import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import strictly from the layer's public API (the root barrel file)
import { Layout } from '@widgets';

import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { APP_ROUTES } from '../../shared/config/routes';
import { Spinner } from '@shared/ui/primitives';

const DashboardPage = React.lazy(() => import('@pages/dashboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const LoginPage = React.lazy(() => import('@pages/login/LoginPage'));

export function AppRouter(): React.ReactElement {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}><Spinner size="lg" /></div>}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path={APP_ROUTES.HOME} element={<DashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}