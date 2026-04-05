import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { Product, CreateProductDTO } from '@entities/product';

export function useCreateProduct(): UseMutationResult<Product, Error, CreateProductDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: productKeys.lists() }); },
  });
}
