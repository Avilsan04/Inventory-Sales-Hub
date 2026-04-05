import { z } from 'zod';
import {
  productSchema,
  categorySchema,
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
} from './product.schema';

export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
