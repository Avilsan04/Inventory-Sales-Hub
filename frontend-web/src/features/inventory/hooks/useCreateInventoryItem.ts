import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';
import type { InventoryItem, CreateInventoryItemDTO } from '@entities/inventory';

export function useCreateInventoryItem(): UseMutationResult<
  InventoryItem,
  Error,
  CreateInventoryItemDTO,
  { previousInventory: InventoryItem[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateInventoryItemDTO) =>
      inventoryApi.createItem(dto, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      }),

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });

      const previousInventory =
        queryClient.getQueryData<InventoryItem[]>(inventoryKeys.lists()) ?? [];

      const optimisticItem: InventoryItem = {
        id: crypto.randomUUID(),
        productId: '',
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        quantity: dto.quantity,
        price: dto.salePrice,
        currency: 'EUR',
        status: dto.quantity === 0 ? 'OUT_OF_STOCK' : 'IN_STOCK',
        reorderThreshold: dto.minStock ?? 5,
        minStock: dto.minStock ?? 5,
        isActive: true,
        lastUpdated: new Date().toISOString(),
        imageUrl: undefined,
        warehouseId: undefined,
        warehouseName: undefined,
      };

      queryClient.setQueryData<InventoryItem[]>(inventoryKeys.lists(), (old) => {
        return old ? [...old, optimisticItem] : [optimisticItem];
      });

      return { previousInventory };
    },

    onError: (_error, _newItem, context) => {
      if (context?.previousInventory) {
        queryClient.setQueryData(inventoryKeys.lists(), context.previousInventory);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all() });
    },
  });
}
