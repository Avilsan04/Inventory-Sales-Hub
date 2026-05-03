import { z } from 'zod';
import {
  productSchema,
  categorySchema,
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  type ProductType,
} from './product.schema';

export type Product = ProductType;
export type Category = z.infer<typeof categorySchema>;
export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;

// Re-export for convenience
export type { ProductType };
export { productSchema };
