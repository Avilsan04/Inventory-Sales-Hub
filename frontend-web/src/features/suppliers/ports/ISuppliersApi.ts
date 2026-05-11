import type {
  Supplier,
  SupplierOrder,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  CreateSupplierOrderDTO,
} from '@entities/supplier';
import type { Product } from '@entities/product';

export interface ISuppliersApi {
  readonly getSuppliers: () => Promise<Supplier[]>;
  readonly getSupplier: (id: string) => Promise<Supplier>;
  readonly getSupplierProducts: (id: string) => Promise<Product[]>;
  readonly createSupplier: (data: CreateSupplierDTO) => Promise<Supplier>;
  readonly updateSupplier: (id: string, data: UpdateSupplierDTO) => Promise<Supplier>;
  readonly deleteSupplier: (id: string) => Promise<void>;
  readonly createOrder: (
    supplierId: string,
    data: CreateSupplierOrderDTO
  ) => Promise<SupplierOrder>;
}
