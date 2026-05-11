import type {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  UpdateRoleDTO,
} from '@entities/employee';

export interface IEmployeesApi {
  readonly getEmployees: () => Promise<Employee[]>;
  readonly getEmployee: (id: string) => Promise<Employee>;
  readonly createEmployee: (data: CreateEmployeeDTO) => Promise<Employee>;
  readonly updateEmployee: (id: string, data: UpdateEmployeeDTO) => Promise<Employee>;
  readonly deactivateEmployee: (id: string) => Promise<void>;
  readonly updateRole: (id: string, data: UpdateRoleDTO) => Promise<Employee>;
}
