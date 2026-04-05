import { z } from 'zod';
import { employeeSchema, employeeRoleSchema, createEmployeeSchema, updateEmployeeSchema, updateRoleSchema } from './employee.schema';

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeRole = z.infer<typeof employeeRoleSchema>;
export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;
