import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDependencies } from '@shared/hooks/useDependencies';
import { APP_ROUTES } from '@shared/config/routes';

export function PublicRoute(): React.ReactElement {
  const { authService } = useDependencies();

  if (authService.isAuthenticated()) {
    return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}