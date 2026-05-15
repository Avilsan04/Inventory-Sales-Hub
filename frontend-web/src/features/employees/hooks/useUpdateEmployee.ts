import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { employeesApi } from '../api/employeesApi';
import { employeeKeys } from './useEmployees';
import type { Employee, UpdateEmployeeDTO } from '@entities/employee';

export function useUpdateEmployee(
  id: string
): UseMutationResult<Employee, Error, UpdateEmployeeDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => employeesApi.updateEmployee(id, data),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all() });
    },
  });
}
