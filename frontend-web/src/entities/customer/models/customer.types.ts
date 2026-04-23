import { z } from 'zod';
import { customerSchema, createCustomerSchema, updateCustomerSchema } from './customer.schema';

export type Customer = z.infer<typeof customerSchema>;
export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
