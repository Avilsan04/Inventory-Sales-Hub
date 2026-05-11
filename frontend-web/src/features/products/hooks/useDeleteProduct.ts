import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { Product } from '@entities/product';

interface DeleteContext {
  previous: Product[] | undefined;
}

export function useDeleteProduct(): UseMutationResult<void, Error, string, DeleteContext> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onMutate: async (id): Promise<DeleteContext> => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      const previous = queryClient.getQueryData<Product[]>(productKeys.lists());
      queryClient.setQueryData<Product[]>(
        productKeys.lists(),
        (old) => old?.filter((p) => p.id !== id) ?? []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(productKeys.lists(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
