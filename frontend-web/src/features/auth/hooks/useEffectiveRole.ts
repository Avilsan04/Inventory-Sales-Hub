import { useAuthMe } from './useAuthMe';
import { useViewMode } from '../context/ViewModeContext';
import type { UserProfile } from '../models/auth.types';

export function useEffectiveRole(): UserProfile['role'] | undefined {
    const { data: user } = useAuthMe();
    const { viewAs } = useViewMode();

    if (user?.role === 'test') return viewAs;
    return user?.role;
}
