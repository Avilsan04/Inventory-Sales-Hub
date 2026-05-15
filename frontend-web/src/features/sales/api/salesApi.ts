import { httpClient } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import type { HttpRequestConfig } from '@core/http';
import {
  saleListSchema,
  paginatedSaleSchema,
  saleSchema,
  saleSummarySchema,
  saleItemSchema,
} from '@entities/sale';
import { z } from 'zod';
import type {
  Sale,
  SaleItem,
  SaleSummary,
  PaginatedSaleResponse,
  CreateSaleDTO,
  UpdateSaleStatusDTO,
} from '@entities/sale';

export interface SaleFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export const salesApi = {
  getSales: async (filters?: SaleFilters): Promise<PaginatedSaleResponse> => {
    const params: Record<string, string | number> = {};
    if (filters?.search) params['search'] = filters.search;
    if (filters?.dateFrom) params['dateFrom'] = filters.dateFrom;
    if (filters?.dateTo) params['dateTo'] = filters.dateTo;
    params['page'] = filters?.page ?? 0;
    params['size'] = filters?.pageSize ?? 20;
    const res = await httpClient.get<unknown>('/sales', { params });
    return parseOrThrow(paginatedSaleSchema, res);
  },

  /** Kept for backwards-compat consumers that need a flat list (e.g. status-distribution chart). */
  getSalesFlat: async (filters?: Omit<SaleFilters, 'page' | 'pageSize'>): Promise<Sale[]> => {
    const params: Record<string, string | number> = { page: 0, size: 1000 };
    if (filters?.search) params['search'] = filters.search;
    if (filters?.dateFrom) params['dateFrom'] = filters.dateFrom;
    if (filters?.dateTo) params['dateTo'] = filters.dateTo;
    const res = await httpClient.get<unknown>('/sales', { params });
    return parseOrThrow(paginatedSaleSchema, res).data;
  },

  getSale: async (id: string): Promise<Sale> => {
    const res = await httpClient.get<unknown>(`/sales/${id}`);
    return parseOrThrow(saleSchema, res);
  },

  getSaleItems: async (id: string): Promise<SaleItem[]> => {
    const res = await httpClient.get<unknown>(`/sales/${id}/items`);
    return parseOrThrow(z.array(saleItemSchema), res);
  },

  getSummary: async (): Promise<SaleSummary> => {
    const res = await httpClient.get<unknown>('/sales/summary');
    return parseOrThrow(saleSummarySchema, res);
  },

  createSale: async (data: CreateSaleDTO, config?: HttpRequestConfig): Promise<Sale> => {
    const payload = {
      customerId: data.customerId ? Number(data.customerId) : undefined,
      items: data.items.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      })),
    };
    const res = await httpClient.post<unknown>('/sales', payload, config);
    return parseOrThrow(saleSchema, res);
  },

  getMyOrders: async (): Promise<Sale[]> => {
    const res = await httpClient.get<unknown>('/sales/my-orders');
    return parseOrThrow(saleListSchema, res);
  },

  updateStatus: async (id: string, data: UpdateSaleStatusDTO): Promise<Sale> => {
    const payload = { status: data.status.toUpperCase() };
    const res = await httpClient.patch<unknown>(`/sales/${id}/status`, payload);
    return parseOrThrow(saleSchema, res);
  },
};
