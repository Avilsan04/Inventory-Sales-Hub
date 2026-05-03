import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from './useInventory';
import type { InventoryItem, StockAdjustmentDTO } from '@entities/inventory';

interface AdjustContext {
  previousList: InventoryItem[] | undefined;
  previousDetail: InventoryItem | undefined;
}

function applyAdjustment(item: InventoryItem, delta: number): InventoryItem {
  const newQty = Math.max(0, item.quantity + delta);
  const threshold = item.reorderThreshold ?? 5;
  const status: InventoryItem['status'] =
    newQty === 0 ? 'OUT_OF_STOCK' : newQty <= threshold ? 'LOW_STOCK' : 'IN_STOCK';
  return { ...item, quantity: newQty, status };
}

export function useAdjustStock(
  id: string
): UseMutationResult<InventoryItem, Error, StockAdjustmentDTO, AdjustContext> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => inventoryApi.adjustStock(id, data),
    onMutate: async (data): Promise<AdjustContext> => {
      await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });
      await queryClient.cancelQueries({ queryKey: inventoryKeys.detail(id) });
      const previousList = queryClient.getQueryData<InventoryItem[]>(inventoryKeys.lists());
      const previousDetail = queryClient.getQueryData<InventoryItem>(inventoryKeys.detail(id));
      queryClient.setQueryData<InventoryItem[]>(
        inventoryKeys.lists(),
        (old) => old?.map((i) => (i.id === id ? applyAdjustment(i, data.quantity) : i)) ?? []
      );
      queryClient.setQueryData<InventoryItem>(inventoryKeys.detail(id), (old) =>
        old !== undefined ? applyAdjustment(old, data.quantity) : undefined
      );
      return { previousList, previousDetail };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(inventoryKeys.lists(), context.previousList);
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(inventoryKeys.detail(id), context.previousDetail);
      }
    },
    onSuccess: (updated) => {
      if (updated.status === 'LOW_STOCK' || updated.status === 'OUT_OF_STOCK') {
        // Fire-and-forget: alert email queue
        fetch(`${window.location.origin}/api/notifications/email-queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'low_stock',
            itemId: updated.id,
            itemName: updated.name,
            quantity: updated.quantity,
            status: updated.status,
          }),
        }).catch(() => {
          /* intentionally silent */
        });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
    },
  });
}
