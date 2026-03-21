import { httpClient } from '@core/http/httpClient';
import { inventoryListSchema, inventoryItemSchema } from '@entities/inventory';
import type { InventoryItem, CreateInventoryItemDTO } from '@entities/inventory';

export const inventoryApi = {
  getInventoryList: async (): Promise<InventoryItem[]> => {
    const response = await httpClient.get<unknown>('/inventory');
    return inventoryListSchema.parse(response);
  },

  createItem: async (data: CreateInventoryItemDTO): Promise<InventoryItem> => {
    const response = await httpClient.post<unknown>('/inventory', data);
    return inventoryItemSchema.parse(response);
  }
};