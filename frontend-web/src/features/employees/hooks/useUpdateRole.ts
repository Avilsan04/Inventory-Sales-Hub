import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { employeesApi } from '../api/employeesApi';
import { employeeKeys } from './useEmployees';
import type { Employee, UpdateRoleDTO } from '@entities/employee';

export function useUpdateRole(id: string): UseMutationResult<Employee, Error, UpdateRoleDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => employeesApi.updateRole(id, data),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all() });
    },
  });
}
