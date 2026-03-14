import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDependencies } from '@shared/hooks/useDependencies';
import { APP_ROUTES } from '@shared/config/routes';

export function ProtectedRoute(): React.ReactElement {
  const location = useLocation();
  const { authService } = useDependencies();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} state={{ from: location }} replace />;
  }
  return <Outlet />;
}