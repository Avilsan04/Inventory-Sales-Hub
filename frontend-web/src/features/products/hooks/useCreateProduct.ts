import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { Product, CreateProductDTO } from '@entities/product';

export function useCreateProduct(): UseMutationResult<
  Product,
  Error,
  CreateProductDTO,
  { previousProducts: Product[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.createProduct,

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists()) ?? [];
      const optimisticProduct: Product = {
        ...dto,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Product[]>(productKeys.lists(), (old) =>
        old ? [...old, optimisticProduct] : [optimisticProduct]
      );

      return { previousProducts };
    },

    onError: (_err, _dto, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.lists(), context.previousProducts);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
