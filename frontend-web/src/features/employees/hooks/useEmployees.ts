import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { employeesApi } from '../api/employeesApi';
import type { Employee } from '@entities/employee';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
};

export function useEmployees(): UseQueryResult<Employee[]> {
  return useQuery({ queryKey: employeeKeys.lists(), queryFn: employeesApi.getEmployees });
}
