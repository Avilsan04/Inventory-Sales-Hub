import { httpClient } from '@core/http';
import type { Product, OrderRequest, OrderResponse } from '../models';

export const productsApi = {
  getAll: (): Promise<Product[]> => httpClient.get<Product[]>('/products'),
  getById: (id: number): Promise<Product> => httpClient.get<Product>(`/products/${id}`),
};

export const ordersApi = {
  create: (order: OrderRequest): Promise<OrderResponse> =>
    httpClient.post<OrderResponse>('/orders', order),
  getByUser: (userId: number): Promise<OrderResponse[]> =>
    httpClient.get<OrderResponse[]>(`/orders/user/${userId}`),
};
