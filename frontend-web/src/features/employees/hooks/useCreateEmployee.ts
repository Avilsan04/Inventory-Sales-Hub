import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { employeesApi } from '../api/employeesApi';
import { employeeKeys } from './useEmployees';
import type { Employee, CreateEmployeeDTO } from '@entities/employee';

export function useCreateEmployee(): UseMutationResult<Employee, Error, CreateEmployeeDTO> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEmployeeDTO) =>
      employeesApi.createEmployee(dto, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all() });
    },
  });
}
