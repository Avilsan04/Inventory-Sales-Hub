import { httpClient } from '@core/http';
import type { HttpRequestConfig } from '@core/http';
import { mapKeysCamel } from '@core/api/mappers';
import { parseOrThrow } from '@core/api/parseOrThrow';
import { supplierListSchema, supplierSchema, supplierOrderSchema } from '@entities/supplier';
import { z } from 'zod';
import type {
  Supplier,
  SupplierOrder,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  CreateSupplierOrderDTO,
} from '@entities/supplier';
import { productListSchema } from '@entities/product';
import type { Product } from '@entities/product';

const paginatedSupplierSchema = z.object({
  data: supplierListSchema,
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const suppliersApi = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await httpClient.get<unknown>('/suppliers');
    return parseOrThrow(paginatedSupplierSchema, res).data;
  },

  getSupplier: async (id: string): Promise<Supplier> => {
    const res = await httpClient.get<unknown>(`/suppliers/${id}`);
    return parseOrThrow(supplierSchema, res);
  },

  getSupplierProducts: async (id: string): Promise<Product[]> => {
    const res = await httpClient.get<unknown>(`/suppliers/${id}/products`);
    return parseOrThrow(productListSchema, mapKeysCamel(res));
  },

  createSupplier: async (
    data: CreateSupplierDTO,
    config?: HttpRequestConfig
  ): Promise<Supplier> => {
    const res = await httpClient.post<unknown>('/suppliers', data, config);
    return parseOrThrow(supplierSchema, res);
  },

  updateSupplier: async (id: string, data: UpdateSupplierDTO): Promise<Supplier> => {
    const res = await httpClient.put<unknown>(`/suppliers/${id}`, data);
    return parseOrThrow(supplierSchema, res);
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await httpClient.delete(`/suppliers/${id}`);
  },

  createOrder: async (
    supplierId: string,
    data: CreateSupplierOrderDTO,
    config?: HttpRequestConfig
  ): Promise<SupplierOrder> => {
    const res = await httpClient.post<unknown>(`/suppliers/${supplierId}/orders`, data, config);
    return parseOrThrow(supplierOrderSchema, res);
  },
};
