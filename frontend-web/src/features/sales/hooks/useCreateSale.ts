import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import { saleKeys } from './useSales';
import { calculateSaleTotals } from '@shared/lib/saleCalculations';
import type { Sale, CreateSaleDTO } from '@entities/sale';

export function useCreateSale(): UseMutationResult<
  Sale,
  Error,
  CreateSaleDTO,
  { previousSales: Sale[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesApi.createSale,

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: saleKeys.lists() });

      const previousSales = queryClient.getQueryData<Sale[]>(saleKeys.lists()) ?? [];

      const {
        subtotal,
        discountAmount,
        taxAmount,
        total: optimisticTotal,
      } = calculateSaleTotals({
        items: dto.items,
        discountPercent: dto.discountPercent,
        taxPercent: dto.taxPercent,
      });

      const optimisticSale: Sale = {
        id: crypto.randomUUID(),
        customerId: dto.customerId,
        employeeId: undefined,
        status: 'pending',
        subtotal,
        discountPercent: dto.discountPercent,
        discountAmount,
        taxPercent: dto.taxPercent,
        taxAmount,
        total: optimisticTotal,
        currency: dto.currency,
        items: dto.items.map((item) => ({
          id: crypto.randomUUID(),
          saleId: '',
          productId: item.productId,
          productName: '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Sale[]>(saleKeys.lists(), (old) =>
        old ? [...old, optimisticSale] : [optimisticSale]
      );

      return { previousSales };
    },

    onError: (_err, _dto, context) => {
      if (context?.previousSales) {
        queryClient.setQueryData(saleKeys.lists(), context.previousSales);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: saleKeys.summary() });
    },
  });
}
