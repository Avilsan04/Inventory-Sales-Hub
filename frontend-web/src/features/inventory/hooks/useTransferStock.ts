import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { warehousesApi } from '../api/warehousesApi';
import { inventoryKeys } from './useInventory';

interface TransferDTO {
  itemId: string;
  quantity: number;
  fromWarehouseId: string;
  toWarehouseId: string;
}

export function useTransferStock(): UseMutationResult<void, Error, TransferDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: warehousesApi.transferStock,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
    },
  });
}
