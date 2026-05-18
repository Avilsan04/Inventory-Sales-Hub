import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { httpClient } from '@core/http/httpClient';
import { withTenant } from '@core/api/queryKeys';
import { saleListSchema } from '../models/sale.schema';
import type { Sale } from '../models/sale.types';

export function useSalesFlatList(): UseQueryResult<Sale[]> {
  return useQuery({
    queryKey: withTenant(['sales', 'flat'] as const),
    queryFn: async () => {
      const res = await httpClient.get<unknown>('/sales?page=0&size=1000');
      const raw = res as Record<string, unknown>;
      const parsed = saleListSchema.safeParse(raw['data'] ?? res);
      return parsed.success ? parsed.data : [];
    },
  });
}
