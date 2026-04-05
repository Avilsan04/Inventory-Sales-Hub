import type { Product, Category, CreateProductDTO, UpdateProductDTO, CreateCategoryDTO } from '@entities/product';

export interface IProductsApi {
  readonly getProducts: () => Promise<Product[]>;
  readonly getProduct: (id: string) => Promise<Product>;
  readonly getCategories: () => Promise<Category[]>;
  readonly createProduct: (data: CreateProductDTO) => Promise<Product>;
  readonly updateProduct: (id: string, data: UpdateProductDTO) => Promise<Product>;
  readonly deleteProduct: (id: string) => Promise<void>;
  readonly createCategory: (data: CreateCategoryDTO) => Promise<Category>;
}
