import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';
import type { InventoryItem, UpdateInventoryItemDTO } from '@entities/inventory';

export function useUpdateInventoryItem(id: string): UseMutationResult<InventoryItem, Error, UpdateInventoryItemDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => inventoryApi.updateItem(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
    },
  });
}
