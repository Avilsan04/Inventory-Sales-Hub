import { z } from 'zod';

const rawCustomerSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullish(),
});

export const customerSchema = rawCustomerSchema.transform(
  (c): {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    createdAt: string;
    updatedAt?: string;
  } => ({
    id: String(c.id),
    name: c.name,
    email: c.email,
    phone: c.phone ?? undefined,
    address: undefined,
    createdAt: new Date(0).toISOString(),
    updatedAt: undefined,
  })
);

export const customerListSchema = z.array(customerSchema);

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema;
