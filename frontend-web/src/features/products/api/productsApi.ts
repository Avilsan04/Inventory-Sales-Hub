import { httpClient } from '@core/http';
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
    return productListSchema.parse(res);
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await httpClient.get<unknown>(`/products/${id}`);
    return productSchema.parse(res);
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await httpClient.get<unknown>('/products/categories');
    return categoryListSchema.parse(res);
  },

  createProduct: async (data: CreateProductDTO): Promise<Product> => {
    const res = await httpClient.post<unknown>('/products', data);
    return productSchema.parse(res);
  },

  updateProduct: async (id: string, data: UpdateProductDTO): Promise<Product> => {
    const res = await httpClient.put<unknown>(`/products/${id}`, data);
    return productSchema.parse(res);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await httpClient.patch<unknown>(`/products/${id}`, { is_active: false });
  },

  createCategory: async (data: CreateCategoryDTO): Promise<Category> => {
    const res = await httpClient.post<unknown>('/products/categories', data);
    return categorySchema.parse(res);
  },
};
