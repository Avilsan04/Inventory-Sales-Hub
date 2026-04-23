import { httpClient } from '@core/http';
import { supplierListSchema, supplierSchema, supplierOrderSchema } from '@entities/supplier';
import type { Supplier, SupplierOrder, CreateSupplierDTO, UpdateSupplierDTO, CreateSupplierOrderDTO } from '@entities/supplier';
import { productListSchema } from '@entities/product';
import type { Product } from '@entities/product';

export const suppliersApi = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await httpClient.get<unknown>('/suppliers');
    return supplierListSchema.parse(res);
  },

  getSupplier: async (id: string): Promise<Supplier> => {
    const res = await httpClient.get<unknown>(`/suppliers/${id}`);
    return supplierSchema.parse(res);
  },

  getSupplierProducts: async (id: string): Promise<Product[]> => {
    const res = await httpClient.get<unknown>(`/suppliers/${id}/products`);
    return productListSchema.parse(res);
  },

  createSupplier: async (data: CreateSupplierDTO): Promise<Supplier> => {
    const res = await httpClient.post<unknown>('/suppliers', data);
    return supplierSchema.parse(res);
  },

  updateSupplier: async (id: string, data: UpdateSupplierDTO): Promise<Supplier> => {
    const res = await httpClient.put<unknown>(`/suppliers/${id}`, data);
    return supplierSchema.parse(res);
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await httpClient.delete<unknown>(`/suppliers/${id}`);
  },

  createOrder: async (supplierId: string, data: CreateSupplierOrderDTO): Promise<SupplierOrder> => {
    const res = await httpClient.post<unknown>(`/suppliers/${supplierId}/orders`, data);
    return supplierOrderSchema.parse(res);
  },
};
