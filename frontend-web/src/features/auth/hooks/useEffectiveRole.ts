import { useAuthMe } from './useAuthMe';
import { useViewMode } from '../context/ViewModeContext';
import type { UserProfile } from '../models/auth.types';

const isMockEnabled = import.meta.env.DEV || import.meta.env.VITE_MOCK_ENABLED === 'true';

export function useEffectiveRole(): UserProfile['role'] | undefined {
  const { data: user } = useAuthMe();
  const { viewAs } = useViewMode();

  // viewAs substitution only active when mocks are enabled — never in production.
  if (user?.role === 'test' && isMockEnabled) return viewAs;
  return user?.role;
}
