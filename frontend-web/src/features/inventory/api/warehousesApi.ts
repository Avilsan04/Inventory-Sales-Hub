import { httpClient } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import { warehouseListSchema } from '@entities/warehouse';
import type { Warehouse } from '@entities/warehouse';

export const warehousesApi = {
  getWarehouses: async (): Promise<Warehouse[]> => {
    const res = await httpClient.get<unknown>('/warehouses');
    return parseOrThrow(warehouseListSchema, res);
  },

  transferStock: async (dto: {
    itemId: string;
    quantity: number;
    fromWarehouseId: string;
    toWarehouseId: string;
  }): Promise<void> => {
    await httpClient.post('/inventory/transfer', dto);
  },
};
