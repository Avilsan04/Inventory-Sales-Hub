import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import { customerKeys } from './useCustomers';

export function useDeleteCustomer(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customersApi.deleteCustomer,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.all() });
    },
  });
}
