import { httpClient } from '@core/http/httpClient';
import type { HttpRequestConfig } from '@core/http';
import { mapKeysCamel } from '@core/api/mappers';
import { parseOrThrow } from '@core/api/parseOrThrow';
import {
  paginatedInventorySchema,
  inventoryListSchema,
  inventoryItemSchema,
  inventoryMovementListSchema,
} from '@entities/inventory';
import type {
  PaginatedInventoryResponse,
  InventoryItem,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  StockAdjustmentDTO,
  InventoryMovement,
} from '@entities/inventory';

export interface InventoryListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  warehouseId?: string;
  status?: string;
}

export const inventoryApi = {
  getInventoryList: async (params?: InventoryListParams): Promise<PaginatedInventoryResponse> => {
    const response = await httpClient.get<unknown>('/inventory', {
      params: params as Record<string, unknown> | undefined,
    });
    return parseOrThrow(
      paginatedInventorySchema,
      mapKeysCamel(response as Record<string, unknown>)
    );
  },

  getItem: async (id: string): Promise<InventoryItem> => {
    const response = await httpClient.get<unknown>(`/inventory/${id}`);
    return parseOrThrow(inventoryItemSchema, mapKeysCamel(response));
  },

  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await httpClient.get<unknown[]>('/inventory/low-stock');
    return parseOrThrow(inventoryListSchema, mapKeysCamel(response));
  },

  getMovements: async (): Promise<InventoryMovement[]> => {
    const response = await httpClient.get<unknown[]>('/inventory/movements');
    return parseOrThrow(inventoryMovementListSchema, mapKeysCamel(response));
  },

  createItem: async (
    data: CreateInventoryItemDTO,
    config?: HttpRequestConfig
  ): Promise<InventoryItem> => {
    const response = await httpClient.post<unknown>('/inventory', data, config);
    return parseOrThrow(inventoryItemSchema, mapKeysCamel(response));
  },

  updateItem: async (id: string, data: UpdateInventoryItemDTO): Promise<InventoryItem> => {
    const response = await httpClient.put<unknown>(`/inventory/${id}`, data);
    return parseOrThrow(inventoryItemSchema, mapKeysCamel(response));
  },

  adjustStock: async (id: string, data: StockAdjustmentDTO): Promise<InventoryItem> => {
    const response = await httpClient.patch<unknown>(`/inventory/${id}/stock`, data);
    return parseOrThrow(inventoryItemSchema, mapKeysCamel(response));
  },

  deleteItem: async (id: string): Promise<void> => {
    await httpClient.delete(`/inventory/${id}`);
  },
};
