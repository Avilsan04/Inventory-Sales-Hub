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
    id: 'ORD-0001',
    status: 'pending',
    subtotal: 1000,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 21,
    taxAmount: 210,
    total: 1210,
    currency: 'EUR',
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
    id: 'inv-001',
    sku: 'SKU-001',
    name: 'Test Item',
    quantity: 10,
    price: 999,
    currency: 'EUR',
    status: 'IN_STOCK',
    isActive: true,
    lastUpdated: '2024-01-01T00:00:00Z',
  };

  it('accepts a valid inventory item', () => {
    expect(() => inventoryItemSchema.parse(validItem)).not.toThrow();
  });

  it('rejects item with invalid status', () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, status: 'UNKNOWN' })).toThrow();
  });
});

describe('Customer Zod schema contracts', () => {
  const validCustomer = {
    id: 'cust-001',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2024-01-01T00:00:00Z',
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
