import { z } from 'zod';

export const customerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
});

export const customerListSchema = z.array(customerSchema);
export const createCustomerSchema = customerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateCustomerSchema = createCustomerSchema;
