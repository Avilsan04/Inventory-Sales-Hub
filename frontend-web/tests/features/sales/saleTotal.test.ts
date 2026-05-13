import { describe, it, expect } from 'vitest';
import { saleSchema, saleItemSchema } from '../../../src/entities/sale/models/sale.schema';


describe('saleSchema', () => {
    const baseItem = {
        id: 1,
        productId: 2,
        productName: 'Widget',
        quantity: 2,
        unitPrice: 10.00,
        subtotal: 20.00,
    };

    const baseSale = {
        id: 1,
        status: 'completed' as const,
        total: 20.00,
        items: [baseItem],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
    };

    it('parses valid sale', () => {
        const result = saleSchema.safeParse(baseSale);
        expect(result.success).toBe(true);
    });

    it('rejects negative total', () => {
        const result = saleSchema.safeParse({ ...baseSale, total: -1 });
        expect(result.success).toBe(false);
    });

    it('rejects sale with zero quantity item', () => {
        const result = saleItemSchema.safeParse({ ...baseItem, quantity: 0 });
        expect(result.success).toBe(false);
    });

    it('rejects negative unit price', () => {
        const result = saleItemSchema.safeParse({ ...baseItem, unitPrice: -5 });
        expect(result.success).toBe(false);
    });

    it('parses item with correct subtotal', () => {
        const result = saleItemSchema.parse(baseItem);
        expect(result.subtotal).toBe(baseItem.quantity * baseItem.unitPrice);
    });
});

describe('cart total calculation', () => {
    interface CartItem { price: number; quantity: number; }

    function calcTotal(items: CartItem[]): number {
        return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }

    it('sums price × quantity for all items', () => {
        const items = [
            { price: 10, quantity: 2 },
            { price: 5, quantity: 3 },
        ];
        expect(calcTotal(items)).toBe(35);
    });

    it('returns 0 for empty cart', () => {
        expect(calcTotal([])).toBe(0);
    });

    it('handles single item', () => {
        expect(calcTotal([{ price: 99.99, quantity: 1 }])).toBeCloseTo(99.99);
    });
});
