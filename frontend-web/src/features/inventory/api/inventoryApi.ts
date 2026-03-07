import { httpClient } from '@core/http/httpClient';
import { inventoryListSchema, inventoryItemSchema } from '@entities/inventory';
import type { InventoryItem, CreateInventoryItemDTO } from '@entities/inventory';

export const inventoryApi = {
  getInventoryList: async (): Promise<InventoryItem[]> => {
    const response = await httpClient.get<unknown>('/inventory');
    const isAxiosResponse = typeof response === 'object' && response !== null && 'data' in response;
    const payload = isAxiosResponse ? (response as Record<string, unknown>).data : response;
    return inventoryListSchema.parse(payload);
  },

  createItem: async (data: CreateInventoryItemDTO): Promise<InventoryItem> => {
    const response = await httpClient.post<unknown>('/inventory', data);
    const isAxiosResponse = typeof response === 'object' && response !== null && 'data' in response;
    const payload = isAxiosResponse ? (response as Record<string, unknown>).data : response;

    return inventoryItemSchema.parse(payload);
  }
};