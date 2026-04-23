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
        mutationFn: inventoryApi.createItem,

        onMutate: async (newItemDTO) => {
            await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });

            const previousInventory = queryClient.getQueryData<InventoryItem[]>(inventoryKeys.lists()) ?? [];
            const optimisticItem: InventoryItem = {
                ...newItemDTO,
                id: crypto.randomUUID(),
                lastUpdated: new Date().toISOString(),
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
            void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        },
    });
}