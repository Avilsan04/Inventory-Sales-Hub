import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthMe } from '@features/auth';
import { useEffectiveRole } from '@features/auth/hooks/useEffectiveRole';
import { APP_ROUTES } from '@shared/config/routes';
import { Spinner } from '@shared/ui/primitives';
import type { UserRole, UserProfile } from '@features/auth/models/auth.types';

const ROLE_DEFAULT_PATH: Record<UserRole, string> = {
  admin: APP_ROUTES.INVENTORY,
  manager: APP_ROUTES.SALES,
  staff: APP_ROUTES.POS,
  company: APP_ROUTES.DASHBOARD,
  customer: APP_ROUTES.CATALOG,
  test: APP_ROUTES.DASHBOARD,
};

interface RoleRouteProps {
  readonly allowedRoles: ReadonlyArray<UserProfile['role']>;
}

export function RoleRoute({ allowedRoles }: RoleRouteProps): React.ReactElement | null {
  const { isLoading } = useAuthMe();
  const effectiveRole = useEffectiveRole();

  if (isLoading) return <Spinner />;

  if (effectiveRole === undefined || !allowedRoles.includes(effectiveRole)) {
    const fallback =
      (effectiveRole !== undefined ? ROLE_DEFAULT_PATH[effectiveRole] : undefined) ??
      APP_ROUTES.DASHBOARD;
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
