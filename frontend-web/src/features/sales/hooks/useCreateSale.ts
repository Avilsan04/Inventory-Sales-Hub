import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import { saleKeys } from './useSales';
import { calculateSaleTotals } from '../lib/saleCalculations';
import { syncDb } from '@shared/lib/db/syncDb';
import type { Sale, CreateSaleDTO } from '@entities/sale';

export function useCreateSale(): UseMutationResult<
  Sale,
  Error,
  CreateSaleDTO,
  { previousSales: Sale[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateSaleDTO): Promise<Sale> => {
      // UUID generated here is the Idempotency-Key — ensures the backend never processes
      // the same sale twice even if a network timeout causes a retry.
      const transactionId = crypto.randomUUID();

      await syncDb.syncQueue.add({
        id: transactionId,
        type: 'CREATE_SALE',
        payload: dto,
        status: 'pending',
        retries: 0,
        createdAt: Date.now(),
      });

      const result = await salesApi.createSale(dto, {
        headers: { 'Idempotency-Key': transactionId },
      });

      await syncDb.syncQueue.update(transactionId, { status: 'completed' });
      return result;
    },

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
