import { z } from 'zod';
import { httpClient } from '@core/http';
import type { HttpRequestConfig } from '@core/http';
import { saleListSchema, saleSchema, saleSummarySchema, saleItemSchema } from '@entities/sale';
import type {
  Sale,
  SaleItem,
  SaleSummary,
  CreateSaleDTO,
  UpdateSaleStatusDTO,
} from '@entities/sale';

export const salesApi = {
  getSales: async (): Promise<Sale[]> => {
    const res = await httpClient.get<Sale[]>('/sales');
    return saleListSchema.parse(res);
  },

  getSale: async (id: string): Promise<Sale> => {
    const res = await httpClient.get<Sale>(`/sales/${id}`);
    return saleSchema.parse(res);
  },

  getSaleItems: async (id: string): Promise<SaleItem[]> => {
    const res = await httpClient.get<SaleItem[]>(`/sales/${id}/items`);
    return z.array(saleItemSchema).parse(res);
  },

  getSummary: async (): Promise<SaleSummary> => {
    const res = await httpClient.get<SaleSummary>('/sales/summary');
    return saleSummarySchema.parse(res);
  },

  createSale: async (data: CreateSaleDTO, config?: HttpRequestConfig): Promise<Sale> => {
    const res = await httpClient.post<Sale>('/sales', data, config);
    return saleSchema.parse(res);
  },

  updateStatus: async (id: string, data: UpdateSaleStatusDTO): Promise<Sale> => {
    const res = await httpClient.patch<Sale>(`/sales/${id}/status`, data);
    return saleSchema.parse(res);
  },
};
