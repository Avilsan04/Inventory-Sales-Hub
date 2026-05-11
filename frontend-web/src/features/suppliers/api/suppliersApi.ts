import { httpClient } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import { supplierListSchema, supplierSchema, supplierOrderSchema } from '@entities/supplier';
import type {
  Supplier,
  SupplierOrder,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  CreateSupplierOrderDTO,
} from '@entities/supplier';
import { productListSchema } from '@entities/product';
import type { Product } from '@entities/product';

export const suppliersApi = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await httpClient.get<unknown>('/suppliers');
    return parseOrThrow(supplierListSchema, res);
  },

  getSupplier: async (id: string): Promise<Supplier> => {
    const res = await httpClient.get<unknown>(`/suppliers/${id}`);
    return parseOrThrow(supplierSchema, res);
  },

  getSupplierProducts: async (id: string): Promise<Product[]> => {
    const res = await httpClient.get<unknown>(`/suppliers/${id}/products`);
    return parseOrThrow(productListSchema, res);
  },

  createSupplier: async (data: CreateSupplierDTO): Promise<Supplier> => {
    const res = await httpClient.post<unknown>('/suppliers', data);
    return parseOrThrow(supplierSchema, res);
  },

  updateSupplier: async (id: string, data: UpdateSupplierDTO): Promise<Supplier> => {
    const res = await httpClient.put<unknown>(`/suppliers/${id}`, data);
    return parseOrThrow(supplierSchema, res);
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await httpClient.delete(`/suppliers/${id}`);
  },

  createOrder: async (supplierId: string, data: CreateSupplierOrderDTO): Promise<SupplierOrder> => {
    const res = await httpClient.post<unknown>(`/suppliers/${supplierId}/orders`, data);
    return parseOrThrow(supplierOrderSchema, res);
  },
};
