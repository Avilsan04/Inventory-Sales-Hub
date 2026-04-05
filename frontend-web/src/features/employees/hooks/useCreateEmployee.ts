import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { employeesApi } from '../api/employeesApi';
import { employeeKeys } from './useEmployees';
import type { Employee, CreateEmployeeDTO } from '@entities/employee';

export function useCreateEmployee(): UseMutationResult<Employee, Error, CreateEmployeeDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.createEmployee,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }); },
  });
}
