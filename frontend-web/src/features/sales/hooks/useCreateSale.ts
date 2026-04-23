import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import { saleKeys } from './useSales';
import type { Sale, CreateSaleDTO } from '@entities/sale';

export function useCreateSale(): UseMutationResult<Sale, Error, CreateSaleDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salesApi.createSale,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: saleKeys.summary() });
    },
  });
}
