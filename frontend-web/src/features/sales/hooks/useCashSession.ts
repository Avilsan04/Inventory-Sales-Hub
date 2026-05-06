import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { cashSessionApi } from '../api/cashSessionApi';
import type { CashSession } from '@entities/cash-session';

export const cashSessionKeys = {
  current: () => ['cash-sessions', 'current'] as const,
};

export function useCashSession(): UseQueryResult<CashSession | null> {
  return useQuery({
    queryKey: cashSessionKeys.current(),
    queryFn: cashSessionApi.getCurrentSession,
    retry: false,
  });
}
