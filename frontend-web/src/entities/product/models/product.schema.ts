import { z } from 'zod';

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const productSchema = z.object({
  id: z.uuid(),
  sku: z.string().min(3).max(50),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  categoryId: z.uuid().optional(),
  category: categorySchema.optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const productListSchema = z.array(productSchema);
export const categoryListSchema = z.array(categorySchema);

export const createProductSchema = productSchema.omit({ id: true, createdAt: true, updatedAt: true, category: true });
export const updateProductSchema = createProductSchema;
export const createCategorySchema = categorySchema.omit({ id: true });
