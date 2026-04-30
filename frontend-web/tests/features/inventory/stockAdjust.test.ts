import { describe, it, expect } from 'vitest';
import { stockAdjustmentSchema } from '../../../src/entities/inventory/models/inventory.schema';

describe('stockAdjustmentSchema', () => {
    it('accepts positive quantity', () => {
        const result = stockAdjustmentSchema.safeParse({ quantity: 10 });
        expect(result.success).toBe(true);
    });

    it('accepts zero quantity', () => {
        const result = stockAdjustmentSchema.safeParse({ quantity: 0 });
        expect(result.success).toBe(true);
    });

    it('accepts negative quantity (subtract stock)', () => {
        const result = stockAdjustmentSchema.safeParse({ quantity: -5 });
        expect(result.success).toBe(true);
    });

    it('rejects non-integer quantity', () => {
        const result = stockAdjustmentSchema.safeParse({ quantity: 1.5 });
        expect(result.success).toBe(false);
    });

    it('accepts optional note', () => {
        const result = stockAdjustmentSchema.safeParse({ quantity: 5, note: 'restock delivery' });
        expect(result.success).toBe(true);
    });

    it('works without note', () => {
        const result = stockAdjustmentSchema.safeParse({ quantity: 3 });
        expect(result.success).toBe(true);
    });

    it('rejects missing quantity', () => {
        const result = stockAdjustmentSchema.safeParse({ note: 'no quantity' });
        expect(result.success).toBe(false);
    });
});
