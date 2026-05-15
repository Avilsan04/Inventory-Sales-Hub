import { describe, it, expect } from 'vitest';
import { toCamelCase, mapKeysCamel } from '../../../src/core/api/mappers';

describe('toCamelCase', () => {
  it('converts snake_case to camelCase', () => {
    expect(toCamelCase('is_active')).toBe('isActive');
    expect(toCamelCase('last_updated_at')).toBe('lastUpdatedAt');
  });

  it('leaves camelCase strings unchanged', () => {
    expect(toCamelCase('isActive')).toBe('isActive');
    expect(toCamelCase('id')).toBe('id');
  });
});

describe('mapKeysCamel', () => {
  it('converts flat object keys to camelCase', () => {
    const result = mapKeysCamel({ is_active: true, product_name: 'Widget' });
    expect(result).toEqual({ isActive: true, productName: 'Widget' });
  });

  it('recursively converts nested object keys', () => {
    const result = mapKeysCamel({
      inventory_item: { unit_price: 9.99, is_low_stock: false },
    });
    expect(result).toEqual({ inventoryItem: { unitPrice: 9.99, isLowStock: false } });
  });

  it('handles arrays by mapping each element', () => {
    const result = mapKeysCamel([{ sale_id: '1' }, { sale_id: '2' }]);
    expect(result).toEqual([{ saleId: '1' }, { saleId: '2' }]);
  });

  it('returns primitives unchanged', () => {
    expect(mapKeysCamel('hello')).toBe('hello');
    expect(mapKeysCamel(42)).toBe(42);
    expect(mapKeysCamel(null)).toBeNull();
  });
});
