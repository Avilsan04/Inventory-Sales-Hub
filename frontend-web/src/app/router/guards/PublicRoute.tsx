import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { tokenStorage } from '@core/storage/tokenStorage';
import { APP_ROUTES } from '@shared/config/routes';

export function PublicRoute(): React.ReactElement {
  const token = tokenStorage.getToken();

  if (token) {
    return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}