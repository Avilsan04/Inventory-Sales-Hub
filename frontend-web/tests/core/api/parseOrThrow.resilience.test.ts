import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseOrThrow } from '../../../src/core/api/parseOrThrow';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

describe('parseOrThrow — API contract resilience', () => {
  it('returns typed data for valid payload', () => {
    const result = parseOrThrow(productSchema, { id: '1', name: 'Widget', price: 9.99 });
    expect(result.price).toBe(9.99);
  });

  it('throws ZodError when price is a string instead of number', () => {
    expect(() =>
      parseOrThrow(productSchema, { id: '1', name: 'Widget', price: 'not-a-number' })
    ).toThrow();
  });

  it('throws ZodError when required field is missing', () => {
    expect(() =>
      parseOrThrow(productSchema, { id: '1', name: 'Widget' })
    ).toThrow();
  });

  it('throws ZodError for completely wrong shape', () => {
    expect(() => parseOrThrow(productSchema, null)).toThrow();
    expect(() => parseOrThrow(productSchema, 'string')).toThrow();
    expect(() => parseOrThrow(productSchema, 42)).toThrow();
  });

  it('throws ZodError with an array when object expected', () => {
    expect(() =>
      parseOrThrow(productSchema, [{ id: '1', name: 'Widget', price: 9.99 }])
    ).toThrow();
  });
});
