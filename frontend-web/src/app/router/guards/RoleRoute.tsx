import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthMe } from '@features/auth';
import { useEffectiveRole } from '@features/auth/hooks/useEffectiveRole';
import { APP_ROUTES } from '@shared/config/routes';
import type { UserProfile } from '@features/auth/models/auth.types';

interface RoleRouteProps {
    readonly allowedRoles: ReadonlyArray<UserProfile['role']>;
}

export function RoleRoute({ allowedRoles }: RoleRouteProps): React.ReactElement | null {
    const { isLoading } = useAuthMe();
    const effectiveRole = useEffectiveRole();

    if (isLoading) return null;

    if (effectiveRole === undefined || !allowedRoles.includes(effectiveRole)) {
        return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
    }

    return <Outlet />;
}
