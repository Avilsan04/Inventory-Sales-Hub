import { httpClient } from '@core/http';
import { employeeListSchema, employeeSchema } from '@entities/employee';
import type { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, UpdateRoleDTO } from '@entities/employee';

export const employeesApi = {
  getEmployees: async (): Promise<Employee[]> => {
    const res = await httpClient.get<unknown>('/employees');
    return employeeListSchema.parse(res);
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const res = await httpClient.get<unknown>(`/employees/${id}`);
    return employeeSchema.parse(res);
  },

  createEmployee: async (data: CreateEmployeeDTO): Promise<Employee> => {
    const res = await httpClient.post<unknown>('/employees', data);
    return employeeSchema.parse(res);
  },

  updateEmployee: async (id: string, data: UpdateEmployeeDTO): Promise<Employee> => {
    const res = await httpClient.put<unknown>(`/employees/${id}`, data);
    return employeeSchema.parse(res);
  },

  deactivateEmployee: async (id: string): Promise<void> => {
    await httpClient.delete<unknown>(`/employees/${id}`);
  },

  updateRole: async (id: string, data: UpdateRoleDTO): Promise<Employee> => {
    const res = await httpClient.patch<unknown>(`/employees/${id}/role`, data);
    return employeeSchema.parse(res);
  },
};
