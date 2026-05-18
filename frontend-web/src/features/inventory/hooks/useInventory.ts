import { useQuery, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import type { InventoryListParams } from '../api/inventoryApi';
import { withTenant } from '@core/api/queryKeys';
import { TIMING } from '@core/config/timing';
import type { PaginatedInventoryResponse } from '@entities/inventory';

export const inventoryKeys = {
  all: (): QueryKey => withTenant(['inventory'] as const),
  lists: (params?: InventoryListParams): QueryKey =>
    params
      ? withTenant(['inventory', 'list', params] as const)
      : withTenant(['inventory', 'list'] as const),
  detail: (id: string): QueryKey => withTenant(['inventory', 'detail', id] as const),
  lowStock: (): QueryKey => withTenant(['inventory', 'low-stock'] as const),
  movements: (): QueryKey => withTenant(['inventory', 'movements'] as const),
};

export function useInventory(
  params?: InventoryListParams
): UseQueryResult<PaginatedInventoryResponse> {
  return useQuery({
    queryKey: inventoryKeys.lists(params),
    queryFn: () => inventoryApi.getInventoryList(params),
    staleTime: TIMING.INVENTORY_STALE_MS,
  });
}
