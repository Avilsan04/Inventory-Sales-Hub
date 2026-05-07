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
    const res = await httpClient.get<Product[]>('/products');
    return productListSchema.parse(res);
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await httpClient.get<Product>(`/products/${id}`);
    return productSchema.parse(res);
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await httpClient.get<Category[]>('/products/categories');
    return categoryListSchema.parse(res);
  },

  createProduct: async (data: CreateProductDTO): Promise<Product> => {
    const res = await httpClient.post<Product>('/products', data);
    return productSchema.parse(res);
  },

  updateProduct: async (id: string, data: UpdateProductDTO): Promise<Product> => {
    const res = await httpClient.put<Product>(`/products/${id}`, data);
    return productSchema.parse(res);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await httpClient.patch(`/products/${id}`, { is_active: false });
  },

  createCategory: async (data: CreateCategoryDTO): Promise<Category> => {
    const res = await httpClient.post<Category>('/products/categories', data);
    return categorySchema.parse(res);
  },
};
