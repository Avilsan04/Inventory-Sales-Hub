import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(3).max(50),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  categoryId: z.string().min(1).optional(),
  category: categorySchema.optional(),
  isActive: z.boolean().default(true),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const productListSchema = z.array(productSchema);
export const categoryListSchema = z.array(categorySchema);

export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  category: true,
  isActive: true,
});
export const updateProductSchema = createProductSchema;
export const createCategorySchema = categorySchema.omit({ id: true });
