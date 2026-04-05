import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { Product, UpdateProductDTO } from '@entities/product';

export function useUpdateProduct(id: string): UseMutationResult<Product, Error, UpdateProductDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productsApi.updateProduct(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}
