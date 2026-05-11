import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { Product, UpdateProductDTO } from '@entities/product';

interface UpdateContext {
  previousList: Product[] | undefined;
  previousDetail: Product | undefined;
}

export function useUpdateProduct(
  id: string
): UseMutationResult<Product, Error, UpdateProductDTO, UpdateContext> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productsApi.updateProduct(id, data),
    onMutate: async (data): Promise<UpdateContext> => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
      const previousList = queryClient.getQueryData<Product[]>(productKeys.lists());
      const previousDetail = queryClient.getQueryData<Product>(productKeys.detail(id));
      const patch = {
        ...data,
        categoryId: data.categoryId !== undefined ? String(data.categoryId) : undefined,
      };
      queryClient.setQueryData<Product[]>(
        productKeys.lists(),
        (old) => old?.map((p) => (p.id === id ? { ...p, ...patch } : p)) ?? []
      );
      queryClient.setQueryData<Product>(productKeys.detail(id), (old) =>
        old !== undefined ? { ...old, ...patch } : undefined
      );
      return { previousList, previousDetail };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(productKeys.lists(), context.previousList);
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(productKeys.detail(id), context.previousDetail);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}
