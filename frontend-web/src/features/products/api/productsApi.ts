import { httpClient } from '@core/http';
import type { HttpRequestConfig } from '@core/http';
import { mapKeysCamel } from '@core/api/mappers';
import { parseOrThrow } from '@core/api/parseOrThrow';
import {
  productListSchema,
  productSchema,
  categoryListSchema,
  categorySchema,
} from '@entities/product';
import type {
  Product,
  Category,
  CreateProductDTO,
  UpdateProductDTO,
  CreateCategoryDTO,
} from '@entities/product';

export const productsApi = {
  getProducts: async (): Promise<Product[]> => {
    const res = await httpClient.get<unknown>('/products');
    return parseOrThrow(productListSchema, mapKeysCamel(res));
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await httpClient.get<unknown>(`/products/${id}`);
    return parseOrThrow(productSchema, mapKeysCamel(res));
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await httpClient.get<unknown>('/products/categories');
    return parseOrThrow(categoryListSchema, mapKeysCamel(res));
  },

  createProduct: async (data: CreateProductDTO, config?: HttpRequestConfig): Promise<Product> => {
    const res = await httpClient.post<unknown>('/products', data, config);
    return parseOrThrow(productSchema, mapKeysCamel(res));
  },

  updateProduct: async (id: string, data: UpdateProductDTO): Promise<Product> => {
    const res = await httpClient.put<unknown>(`/products/${id}`, data);
    return parseOrThrow(productSchema, mapKeysCamel(res));
  },

  deleteProduct: async (id: string): Promise<void> => {
    await httpClient.delete(`/products/${id}`);
  },

  createCategory: async (data: CreateCategoryDTO): Promise<Category> => {
    const res = await httpClient.post<unknown>('/products/categories', data);
    return parseOrThrow(categorySchema, mapKeysCamel(res));
  },
};
