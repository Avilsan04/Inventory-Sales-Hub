import { z } from 'zod';

export const employeeRoleSchema = z.enum(['admin', 'manager', 'staff']);

export const employeeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: employeeRoleSchema,
  isActive: z.boolean().default(true),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const employeeListSchema = z.array(employeeSchema);
export const createEmployeeSchema = employeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateEmployeeSchema = createEmployeeSchema.partial();
export const updateRoleSchema = z.object({ role: employeeRoleSchema });
