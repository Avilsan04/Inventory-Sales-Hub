import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { warehousesApi } from '../api/warehousesApi';
import type { Warehouse } from '@entities/warehouse';

export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
};

export function useWarehouses(): UseQueryResult<Warehouse[]> {
  return useQuery({
    queryKey: warehouseKeys.lists(),
    queryFn: warehousesApi.getWarehouses,
    staleTime: 300_000,
  });
}
