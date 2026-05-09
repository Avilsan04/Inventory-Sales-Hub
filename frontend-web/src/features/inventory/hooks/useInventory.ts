import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { withTenant } from '@core/api/queryKeys';
import type { InventoryItem } from '@entities/inventory';

export const inventoryKeys = {
  all: (): QueryKey => withTenant(['inventory'] as const),
  lists: (): QueryKey => withTenant(['inventory', 'list'] as const),
  detail: (id: string): QueryKey => withTenant(['inventory', 'detail', id] as const),
  lowStock: (): QueryKey => withTenant(['inventory', 'low-stock'] as const),
  movements: (): QueryKey => withTenant(['inventory', 'movements'] as const),
};

export function useInventory(): UseQueryResult<InventoryItem[]> {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: inventoryApi.getInventoryList,
    staleTime: 30_000,
  });
}
