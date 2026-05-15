import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import { supplierKeys } from './useSuppliers';
import type { SupplierOrder, CreateSupplierOrderDTO } from '@entities/supplier';

export function useCreateSupplierOrder(
  supplierId: string
): UseMutationResult<SupplierOrder, Error, CreateSupplierOrderDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupplierOrderDTO) =>
      suppliersApi.createOrder(supplierId, dto, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all() });
    },
  });
}
