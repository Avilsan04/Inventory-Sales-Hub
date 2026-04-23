import { z } from 'zod';
import { httpClient } from '@core/http';
import { saleListSchema, saleSchema, saleSummarySchema, saleItemSchema } from '@entities/sale';
import type { Sale, SaleItem, SaleSummary, CreateSaleDTO, UpdateSaleStatusDTO } from '@entities/sale';

export const salesApi = {
  getSales: async (): Promise<Sale[]> => {
    const res = await httpClient.get<unknown>('/sales');
    return saleListSchema.parse(res);
  },

  getSale: async (id: string): Promise<Sale> => {
    const res = await httpClient.get<unknown>(`/sales/${id}`);
    return saleSchema.parse(res);
  },

  getSaleItems: async (id: string): Promise<SaleItem[]> => {
    const res = await httpClient.get<unknown>(`/sales/${id}/items`);
    return z.array(saleItemSchema).parse(res);
  },

  getSummary: async (): Promise<SaleSummary> => {
    const res = await httpClient.get<unknown>('/sales/summary');
    return saleSummarySchema.parse(res);
  },

  createSale: async (data: CreateSaleDTO): Promise<Sale> => {
    const res = await httpClient.post<unknown>('/sales', data);
    return saleSchema.parse(res);
  },

  updateStatus: async (id: string, data: UpdateSaleStatusDTO): Promise<Sale> => {
    const res = await httpClient.patch<unknown>(`/sales/${id}/status`, data);
    return saleSchema.parse(res);
  },
};
