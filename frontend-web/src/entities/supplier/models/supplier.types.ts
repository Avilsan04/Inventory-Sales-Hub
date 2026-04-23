import { z } from 'zod';
import {
  supplierSchema,
  supplierOrderSchema,
  supplierOrderStatusSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createSupplierOrderSchema,
} from './supplier.schema';

export type Supplier = z.infer<typeof supplierSchema>;
export type SupplierOrder = z.infer<typeof supplierOrderSchema>;
export type SupplierOrderStatus = z.infer<typeof supplierOrderStatusSchema>;
export type CreateSupplierDTO = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierDTO = z.infer<typeof updateSupplierSchema>;
export type CreateSupplierOrderDTO = z.infer<typeof createSupplierOrderSchema>;
