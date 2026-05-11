import * as React from 'react';
import { useEffectiveRole } from '../hooks';
import { hasPermission } from '@shared/lib/permissions';
import type { Permission } from '@shared/lib/permissions';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps): React.ReactElement {
  const role = useEffectiveRole();
  if (!hasPermission(role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
