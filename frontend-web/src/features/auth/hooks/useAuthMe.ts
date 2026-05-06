import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { UserProfile } from '../models/auth.types';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useAuthMe(): UseQueryResult<UserProfile> {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    staleTime: Infinity,
  });
}
