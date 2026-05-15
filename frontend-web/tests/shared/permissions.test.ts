import { describe, it, expect } from 'vitest';
import { hasPermission } from '../../src/shared/lib/permissions';

describe('hasPermission', () => {
  it('returns false for undefined role', () => {
    expect(hasPermission(undefined, 'create:product')).toBe(false);
  });

  it('admin has all permissions', () => {
    expect(hasPermission('admin', 'create:product')).toBe(true);
    expect(hasPermission('admin', 'view:audit')).toBe(true);
    expect(hasPermission('admin', 'transfer:stock')).toBe(true);
  });

  it('customer has no permissions', () => {
    expect(hasPermission('customer', 'create:sale')).toBe(false);
    expect(hasPermission('customer', 'view:analytics')).toBe(false);
  });

  it('staff can create sale and adjust stock', () => {
    expect(hasPermission('staff', 'create:sale')).toBe(true);
    expect(hasPermission('staff', 'adjust:stock')).toBe(true);
  });

  it('staff cannot create products or view analytics', () => {
    expect(hasPermission('staff', 'create:product')).toBe(false);
    expect(hasPermission('staff', 'view:analytics')).toBe(false);
  });

  it('manager has all operational permissions', () => {
    expect(hasPermission('manager', 'create:inventory')).toBe(true);
    expect(hasPermission('manager', 'manage:warehouses')).toBe(true);
  });

  it('company can view analytics and audit but not create inventory', () => {
    expect(hasPermission('company', 'view:analytics')).toBe(true);
    expect(hasPermission('company', 'view:audit')).toBe(true);
    expect(hasPermission('company', 'create:inventory')).toBe(false);
  });

  it('test role has all permissions like admin', () => {
    expect(hasPermission('test', 'create:product')).toBe(true);
    expect(hasPermission('test', 'view:audit')).toBe(true);
  });
});
