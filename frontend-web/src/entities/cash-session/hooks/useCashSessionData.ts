import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { httpClient } from '@core/http/httpClient';
import { withTenant } from '@core/api/queryKeys';
import { cashSessionSchema } from '../models/cashSession.schema';
import type { CashSession } from '../models/cashSession.schema';

export function useCashSessionData(): UseQueryResult<CashSession | null> {
  return useQuery({
    queryKey: withTenant(['cash-sessions', 'current'] as const),
    queryFn: async () => {
      try {
        const res = await httpClient.get<unknown>('/sales/cash-sessions/current');
        return cashSessionSchema.parse(res);
      } catch {
        return null;
      }
    },
    retry: false,
  });
}
