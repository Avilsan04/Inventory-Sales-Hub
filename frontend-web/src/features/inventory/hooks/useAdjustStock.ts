import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';
import type { InventoryItem, StockAdjustmentDTO } from '@entities/inventory';

export function useAdjustStock(id: string): UseMutationResult<InventoryItem, Error, StockAdjustmentDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => inventoryApi.adjustStock(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
    },
  });
}
