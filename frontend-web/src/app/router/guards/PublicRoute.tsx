import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { tokenStorage } from '@core/storage/tokenStorage';
import { APP_ROUTES } from '../../../shared/config/routes';

export function PublicRoute(): React.ReactElement {
  const isAuthenticated = tokenStorage.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  return <Outlet />;
}