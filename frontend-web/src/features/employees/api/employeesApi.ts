import { httpClient } from '@core/http';
import type { HttpRequestConfig } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import { employeeListSchema, employeeSchema } from '@entities/employee';
import type {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  UpdateRoleDTO,
} from '@entities/employee';

export const employeesApi = {
  getEmployees: async (): Promise<Employee[]> => {
    const res = await httpClient.get<unknown>('/employees');
    return parseOrThrow(employeeListSchema, res);
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const res = await httpClient.get<unknown>(`/employees/${id}`);
    return parseOrThrow(employeeSchema, res);
  },

  createEmployee: async (
    data: CreateEmployeeDTO,
    config?: HttpRequestConfig
  ): Promise<Employee> => {
    const res = await httpClient.post<unknown>('/employees', data, config);
    return parseOrThrow(employeeSchema, res);
  },

  updateEmployee: async (id: string, data: UpdateEmployeeDTO): Promise<Employee> => {
    const res = await httpClient.put<unknown>(`/employees/${id}`, data);
    return parseOrThrow(employeeSchema, res);
  },

  deactivateEmployee: async (id: string): Promise<void> => {
    await httpClient.delete(`/employees/${id}`);
  },

  updateRole: async (id: string, data: UpdateRoleDTO): Promise<Employee> => {
    const res = await httpClient.patch<unknown>(`/employees/${id}/role`, data);
    return parseOrThrow(employeeSchema, res);
  },
};
