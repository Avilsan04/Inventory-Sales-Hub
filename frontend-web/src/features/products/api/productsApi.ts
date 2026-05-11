import { httpClient } from '@core/http';
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
    return parseOrThrow(productListSchema, res);
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await httpClient.get<unknown>(`/products/${id}`);
    return parseOrThrow(productSchema, res);
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await httpClient.get<unknown>('/products/categories');
    return parseOrThrow(categoryListSchema, res);
  },

  createProduct: async (data: CreateProductDTO): Promise<Product> => {
    const res = await httpClient.post<unknown>('/products', data);
    return parseOrThrow(productSchema, res);
  },

  updateProduct: async (id: string, data: UpdateProductDTO): Promise<Product> => {
    const res = await httpClient.put<unknown>(`/products/${id}`, data);
    return parseOrThrow(productSchema, res);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await httpClient.patch(`/products/${id}`, { is_active: false });
  },

  createCategory: async (data: CreateCategoryDTO): Promise<Category> => {
    const res = await httpClient.post<unknown>('/products/categories', data);
    return parseOrThrow(categorySchema, res);
  },
};
