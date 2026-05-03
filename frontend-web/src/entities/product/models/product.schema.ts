import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const uomSchema = z.enum(['unit', 'kg', 'litre', 'box', 'pack']);

// Product type with self-referential variants
export interface ProductType {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  categoryId?: string;
  category?: z.infer<typeof categorySchema>;
  parentId?: string;
  uom: z.infer<typeof uomSchema>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductType[];
}

export const productSchema: z.ZodType<ProductType> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    sku: z.string().min(3).max(50),
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().int().nonnegative(),
    currency: z.string().length(3).default('USD'),
    categoryId: z.string().min(1).optional(),
    category: categorySchema.optional(),
    parentId: z.string().min(1).optional(),
    uom: uomSchema.default('unit'),
    isActive: z.boolean().default(true),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    variants: z.array(productSchema).optional(),
  })
);

export const productListSchema = z.array(productSchema);
export const categoryListSchema = z.array(categorySchema);

export const createProductSchema = z.object({
  sku: z.string().min(3).max(50),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  categoryId: z.string().min(1).optional(),
  parentId: z.string().min(1).optional(),
  uom: uomSchema.default('unit'),
});

export const updateProductSchema = createProductSchema;
export const createCategorySchema = categorySchema.omit({ id: true });
