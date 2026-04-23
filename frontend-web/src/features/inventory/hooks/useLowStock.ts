import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';
import type { InventoryItem } from '@entities/inventory';

export function useLowStock(): UseQueryResult<InventoryItem[]> {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: inventoryApi.getLowStock,
  });
}
