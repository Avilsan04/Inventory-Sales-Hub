import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { tokenStorage } from '@core/storage/tokenStorage';
import { APP_ROUTES } from '../../../shared/config/routes';

export function ProtectedRoute(): React.ReactElement {
  const location = useLocation();
  const isAuthenticated = tokenStorage.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted url for post-login redirection
    return <Navigate to={APP_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}