import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';
import type { InventoryMovement } from '@entities/inventory';

export function useInventoryMovements(): UseQueryResult<InventoryMovement[]> {
  return useQuery({
    queryKey: inventoryKeys.movements(),
    queryFn: inventoryApi.getMovements,
  });
}
