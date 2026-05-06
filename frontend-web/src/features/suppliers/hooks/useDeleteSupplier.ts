import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import { supplierKeys } from './useSuppliers';

export function useDeleteSupplier(): UseMutationResult<void, Error, string> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: suppliersApi.deleteSupplier,
        onSuccess: () => { void queryClient.invalidateQueries({ queryKey: supplierKeys.lists() }); },
    });
}
