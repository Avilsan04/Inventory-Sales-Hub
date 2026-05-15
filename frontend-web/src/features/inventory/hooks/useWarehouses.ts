import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { warehousesApi } from '../api/warehousesApi';
import { withTenant } from '@core/api/queryKeys';
import type { Warehouse } from '@entities/warehouse';

export const warehouseKeys = {
  all: (): [string, 'warehouses'] => withTenant(['warehouses'] as const),
  lists: (): [string, 'warehouses', 'list'] => withTenant(['warehouses', 'list'] as const),
};

export function useWarehouses(): UseQueryResult<Warehouse[]> {
  return useQuery({
    queryKey: warehouseKeys.lists(),
    queryFn: warehousesApi.getWarehouses,
    staleTime: 300_000,
  });
}
