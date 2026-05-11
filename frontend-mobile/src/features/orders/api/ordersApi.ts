import { httpClient } from '@core/http';
import type { OrderRequest, OrderResponse } from '../models';

export const ordersApi = {
  create: async (order: OrderRequest): Promise<OrderResponse> => {
    return await httpClient.post<OrderResponse>('/api/orders', order);
  },

  getByUser: async (userId: number): Promise<OrderResponse[]> => {
    return await httpClient.get<OrderResponse[]>(`/api/orders/user/${userId}`);
  },
};
