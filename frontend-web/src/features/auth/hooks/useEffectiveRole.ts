import { useAuthMe } from './useAuthMe';
import { useViewMode } from '../context/ViewModeContext';
import type { UserProfile } from '../models/auth.types';

const VISTA_ROLES = ['company', 'admin', 'manager', 'test'] as const;

export function useEffectiveRole(): UserProfile['role'] | undefined {
  const { data: user } = useAuthMe();
  const { viewAs } = useViewMode();

  if (user?.role && (VISTA_ROLES as readonly string[]).includes(user.role)) return viewAs;
  return user?.role;
}
