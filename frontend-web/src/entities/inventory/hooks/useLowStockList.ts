import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { httpClient } from '@core/http/httpClient';
import { withTenant } from '@core/api/queryKeys';
import { inventoryListSchema } from '../models/inventory.schema';
import type { InventoryItem } from '../models/inventory.types';

export function useLowStockList(): UseQueryResult<InventoryItem[]> {
  return useQuery({
    queryKey: withTenant(['inventory', 'low-stock'] as const),
    queryFn: async () => {
      const res = await httpClient.get<unknown>('/inventory/low-stock');
      return inventoryListSchema.parse(res);
    },
  });
}
