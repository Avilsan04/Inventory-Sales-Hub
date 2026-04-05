import { httpClient } from '@core/http/httpClient';
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
    const response = await httpClient.get<unknown>('/inventory');
    return inventoryListSchema.parse(response);
  },

  getItem: async (id: string): Promise<InventoryItem> => {
    const response = await httpClient.get<unknown>(`/inventory/${id}`);
    return inventoryItemSchema.parse(response);
  },

  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await httpClient.get<unknown>('/inventory/low-stock');
    return inventoryListSchema.parse(response);
  },

  getMovements: async (): Promise<InventoryMovement[]> => {
    const response = await httpClient.get<unknown>('/inventory/movements');
    return inventoryMovementListSchema.parse(response);
  },

  createItem: async (data: CreateInventoryItemDTO): Promise<InventoryItem> => {
    const response = await httpClient.post<unknown>('/inventory', data);
    return inventoryItemSchema.parse(response);
  },

  updateItem: async (id: string, data: UpdateInventoryItemDTO): Promise<InventoryItem> => {
    const response = await httpClient.put<unknown>(`/inventory/${id}`, data);
    return inventoryItemSchema.parse(response);
  },

  adjustStock: async (id: string, data: StockAdjustmentDTO): Promise<InventoryItem> => {
    const response = await httpClient.patch<unknown>(`/inventory/${id}/stock`, data);
    return inventoryItemSchema.parse(response);
  },

  deleteItem: async (id: string): Promise<void> => {
    await httpClient.delete<unknown>(`/inventory/${id}`);
  },
};