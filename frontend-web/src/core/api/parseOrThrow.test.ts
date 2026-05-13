import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseOrThrow } from './parseOrThrow';
import { saleSchema, saleListSchema } from '@entities/sale';
import { inventoryItemSchema } from '@entities/inventory';
import { customerSchema } from '@entities/customer';

describe('parseOrThrow', () => {
  it('returns parsed value on valid data', () => {
    const schema = z.object({ id: z.string(), name: z.string() });
    const result = parseOrThrow(schema, { id: '1', name: 'Test' });
    expect(result).toEqual({ id: '1', name: 'Test' });
  });

  it('throws ZodError on invalid data', () => {
    const schema = z.object({ id: z.string() });
    expect(() => parseOrThrow(schema, { id: 42 })).toThrow();
  });
});

describe('Sale Zod schema contracts', () => {
  const validSale = {
    id: 1,
    status: 'pending',
    subtotal: 1000,
    taxAmount: 210,
    total: 1210,
    items: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('accepts a valid sale', () => {
    expect(() => saleSchema.parse(validSale)).not.toThrow();
  });

  it('rejects sale with missing required fields', () => {
    const { id: _id, ...withoutId } = validSale;
    void _id;
    expect(() => saleSchema.parse(withoutId)).toThrow();
  });

  it('accepts empty sale list', () => {
    expect(() => saleListSchema.parse([])).not.toThrow();
  });

  it('rejects non-array sale list', () => {
    expect(() => saleListSchema.parse(validSale)).toThrow();
  });
});

describe('InventoryItem Zod schema contracts', () => {
  const validItem = {
    id: 1,
    product: {
      id: 1,
      name: 'Test Item',
      description: 'Test description',
      sku: 'SKU-001',
      purchasePrice: 800,
      salePrice: 999,
      category: null,
      isActive: true,
    },
    quantity: 10,
    minStock: 5,
    isLowStock: false,
  };

  it('accepts a valid inventory item', () => {
    expect(() => inventoryItemSchema.parse(validItem)).not.toThrow();
  });

  it('rejects item with invalid quantity', () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, quantity: -1 })).toThrow();
  });
});

describe('Customer Zod schema contracts', () => {
  const validCustomer = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('accepts a valid customer', () => {
    expect(() => customerSchema.parse(validCustomer)).not.toThrow();
  });

  it('rejects customer without required email', () => {
    const { email: _email, ...withoutEmail } = validCustomer;
    void _email;
    expect(() => customerSchema.parse(withoutEmail)).toThrow();
  });
});
