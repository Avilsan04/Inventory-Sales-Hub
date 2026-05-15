import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import { supplierKeys } from './useSuppliers';
import type { Supplier, CreateSupplierDTO } from '@entities/supplier';

export function useCreateSupplier(): UseMutationResult<Supplier, Error, CreateSupplierDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupplierDTO) =>
      suppliersApi.createSupplier(dto, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all() });
    },
  });
}
