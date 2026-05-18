import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { employeesApi } from '../api/employeesApi';
import { employeeKeys } from './useEmployees';

export function useDeleteEmployee(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.deactivateEmployee,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all() });
    },
  });
}
