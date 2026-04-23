import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';

export function useDeleteInventoryItem(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.deleteItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}
