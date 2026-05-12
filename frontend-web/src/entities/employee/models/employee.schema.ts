import { z } from 'zod';

export const employeeRoleSchema = z
  .enum(['admin', 'manager', 'staff', 'ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'])
  .transform((r) => r.toLowerCase() as 'admin' | 'manager' | 'staff');

const rawEmployeeSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.email(),
  role: z.string(),
});

export const employeeSchema = rawEmployeeSchema.transform(
  (
    e
  ): {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } => ({
    id: String(e.id),
    name: e.username,
    email: e.email,
    role: e.role.toLowerCase() as 'admin' | 'manager' | 'staff',
    isActive: true,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  })
);

export const employeeListSchema = z.array(employeeSchema);

export const createEmployeeSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager', 'staff']),
});

export const updateEmployeeSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.email().optional(),
});

export const updateRoleSchema = z.object({ role: z.enum(['admin', 'manager', 'staff']) });
