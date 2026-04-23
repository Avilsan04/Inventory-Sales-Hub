import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';
import type { InventoryItem } from '@entities/inventory';

export function useInventoryItem(id: string): UseQueryResult<InventoryItem> {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.getItem(id),
    enabled: id.trim().length > 0,
  });
}
