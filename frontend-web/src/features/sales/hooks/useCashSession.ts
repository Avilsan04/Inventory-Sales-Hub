import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { cashSessionApi } from '../api/cashSessionApi';
import { withTenant } from '@core/api/queryKeys';
import type { CashSession } from '@entities/cash-session';

export const cashSessionKeys = {
  current: (): [string, 'cash-sessions', 'current'] =>
    withTenant(['cash-sessions', 'current'] as const),
};

export function useCashSession(): UseQueryResult<CashSession | null> {
  return useQuery({
    queryKey: cashSessionKeys.current(),
    queryFn: cashSessionApi.getCurrentSession,
    retry: false,
  });
}
