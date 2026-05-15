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
    mutationFn: (dto: CreateProductDTO) =>
      productsApi.createProduct(dto, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      }),

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });

      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.lists()) ?? [];
      const optimisticProduct: Product = {
        id: crypto.randomUUID(),
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        price: dto.salePrice,
        purchasePrice: dto.purchasePrice,
        salePrice: dto.salePrice,
        currency: 'EUR',
        categoryId: dto.categoryId ? String(dto.categoryId) : undefined,
        supplierId: dto.supplierId,
        supplierName: undefined,
        uom: 'unit',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageUrl: undefined,
        parentId: undefined,
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
      void queryClient.invalidateQueries({ queryKey: productKeys.all() });
    },
  });
}
