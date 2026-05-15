import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import { supplierKeys } from './useSuppliers';
import type { Supplier, UpdateSupplierDTO } from '@entities/supplier';

export function useUpdateSupplier(
  id: string
): UseMutationResult<Supplier, Error, UpdateSupplierDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => suppliersApi.updateSupplier(id, data),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: supplierKeys.all() });
    },
  });
}
