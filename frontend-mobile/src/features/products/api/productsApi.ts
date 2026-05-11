import { httpClient } from '@core/http';
import { ENABLE_MOCK, mockProducts, mockOrders } from '@core/mock/mockData';
import type { Product, OrderRequest, OrderResponse } from '../models';

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    if (ENABLE_MOCK) {
      await new Promise(r => setTimeout(r, 600));
      return mockProducts;
    }
    return httpClient.get<Product[]>('/api/products');
  },

  getById: async (id: number): Promise<Product> => {
    if (ENABLE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('Producto no encontrado');
      return product;
    }
    return httpClient.get<Product>(`/api/products/${id}`);
  },
};

export const ordersApi = {
  create: async (order: OrderRequest): Promise<OrderResponse> => {
    if (ENABLE_MOCK) {
      await new Promise(r => setTimeout(r, 800));
      return {
        id: Math.floor(Math.random() * 1000),
        status: 'PENDING',
        total: order.items.reduce((acc, item) => {
          const product = mockProducts.find(p => p.id === item.productId);
          return acc + (product?.price ?? 0) * item.quantity;
        }, 0),
        createdAt: new Date().toISOString(),
        items: order.items.map(item => {
          const product = mockProducts.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            productName: product?.name ?? 'Producto',
            quantity: item.quantity,
            price: product?.price ?? 0,
          };
        }),
      };
    }
    return httpClient.post<OrderResponse>('/api/orders', order);
  },

  getByUser: async (_userId: number): Promise<OrderResponse[]> => {
    if (ENABLE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      return mockOrders;
    }
    return httpClient.get<OrderResponse[]>(`/api/orders/user/${_userId}`);
  },
};
