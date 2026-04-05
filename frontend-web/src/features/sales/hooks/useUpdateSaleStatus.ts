import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import { saleKeys } from './useSales';
import type { Sale, UpdateSaleStatusDTO } from '@entities/sale';

export function useUpdateSaleStatus(id: string): UseMutationResult<Sale, Error, UpdateSaleStatusDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => salesApi.updateStatus(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: saleKeys.summary() });
    },
  });
}
