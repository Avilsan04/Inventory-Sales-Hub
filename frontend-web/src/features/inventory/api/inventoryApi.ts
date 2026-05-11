import { httpClient } from '@core/http/httpClient';
import { mapKeysCamel } from '@core/api/mappers';
import { parseOrThrow } from '@core/api/parseOrThrow';
import {
  inventoryListSchema,
  inventoryItemSchema,
  inventoryMovementListSchema,
} from '@entities/inventory';
import type {
  InventoryItem,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  StockAdjustmentDTO,
  InventoryMovement,
} from '@entities/inventory';

export const inventoryApi = {
  getInventoryList: async (): Promise<InventoryItem[]> => {
    const response = await httpClient.get<unknown[]>('/inventory');
    return parseOrThrow(inventoryListSchema, mapKeysCamel(response));
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

  createItem: async (data: CreateInventoryItemDTO): Promise<InventoryItem> => {
    const response = await httpClient.post<unknown>('/inventory', data);
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
