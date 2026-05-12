import { z } from 'zod';

const rawCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().nullish(),
});

export const categorySchema = rawCategorySchema.transform(
  (c): { id: string; name: string; description?: string } => ({
    id: String(c.id),
    name: c.name,
    description: c.description ?? undefined,
  })
);

export const uomSchema = z.enum(['unit', 'kg', 'litre', 'box', 'pack']);

const rawProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().nullish(),
  sku: z.string(),
  purchasePrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  category: rawCategorySchema.nullish(),
  supplierId: z.number().nullish(),
  supplierName: z.string().nullish(),
  isActive: z.boolean(),
});

export const productSchema = rawProductSchema.transform(
  (
    p
  ): {
    id: string;
    name: string;
    description?: string;
    sku: string;
    price: number;
    purchasePrice: number;
    salePrice: number;
    currency: string;
    categoryId?: string;
    category?: { id: string; name: string; description?: string };
    supplierId?: number;
    supplierName?: string;
    uom: 'unit' | 'kg' | 'litre' | 'box' | 'pack';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    imageUrl?: string;
    parentId?: string;
  } => ({
    id: String(p.id),
    name: p.name,
    description: p.description ?? undefined,
    sku: p.sku,
    price: p.salePrice,
    purchasePrice: p.purchasePrice,
    salePrice: p.salePrice,
    currency: 'EUR',
    categoryId: p.category ? String(p.category.id) : undefined,
    category: p.category
      ? {
          id: String(p.category.id),
          name: p.category.name,
          description: p.category.description ?? undefined,
        }
      : undefined,
    supplierId: p.supplierId ?? undefined,
    supplierName: p.supplierName ?? undefined,
    uom: 'unit',
    isActive: p.isActive,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    imageUrl: undefined,
    parentId: undefined,
  })
);

export type ProductType = z.infer<typeof productSchema>;

export const productListSchema = z.array(productSchema);
export const categoryListSchema = z.array(categorySchema);

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().min(3).max(50),
  purchasePrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  categoryId: z.number().optional(),
  supplierId: z.number().optional(),
});

export const updateProductSchema = createProductSchema;

export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
