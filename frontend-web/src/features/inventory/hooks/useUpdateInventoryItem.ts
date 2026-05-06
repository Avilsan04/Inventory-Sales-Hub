import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';
import type { InventoryItem, UpdateInventoryItemDTO } from '@entities/inventory';

export function useUpdateInventoryItem(
  id: string
): UseMutationResult<
  InventoryItem,
  Error,
  UpdateInventoryItemDTO,
  { previousItem: InventoryItem | undefined; previousList: InventoryItem[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => inventoryApi.updateItem(id, data),

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: inventoryKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });

      const previousItem = queryClient.getQueryData<InventoryItem>(inventoryKeys.detail(id));
      const previousList = queryClient.getQueryData<InventoryItem[]>(inventoryKeys.lists()) ?? [];

      if (previousItem) {
        queryClient.setQueryData<InventoryItem>(inventoryKeys.detail(id), {
          ...previousItem,
          ...dto,
          lastUpdated: new Date().toISOString(),
        });
      }

      queryClient.setQueryData<InventoryItem[]>(
        inventoryKeys.lists(),
        (old) =>
          old?.map((item) =>
            item.id === id ? { ...item, ...dto, lastUpdated: new Date().toISOString() } : item
          ) ?? []
      );

      return { previousItem, previousList };
    },

    onError: (_err, _dto, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(inventoryKeys.detail(id), context.previousItem);
      }
      if (context?.previousList) {
        queryClient.setQueryData(inventoryKeys.lists(), context.previousList);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
    },
  });
}
