import { describe, it, expect } from 'vitest';
import { hasPermission } from './permissions';
import type { Permission } from './permissions';

describe('hasPermission', () => {
  it('returns false for undefined role', () => {
    expect(hasPermission(undefined, 'create:product')).toBe(false);
  });

  it('admin has all permissions', () => {
    const permissions: Permission[] = [
      'create:product',
      'delete:product',
      'create:inventory',
      'adjust:stock',
      'view:employees',
      'view:analytics',
      'create:sale',
      'manage:suppliers',
      'export:csv',
      'view:audit',
      'open:cash-session',
      'close:cash-session',
    ];
    permissions.forEach((p) => {
      expect(hasPermission('admin', p)).toBe(true);
    });
  });

  it('customer has no permissions', () => {
    expect(hasPermission('customer', 'create:product')).toBe(false);
    expect(hasPermission('customer', 'create:sale')).toBe(false);
    expect(hasPermission('customer', 'view:analytics')).toBe(false);
  });

  it('staff can create sales and adjust stock, cannot create products', () => {
    expect(hasPermission('staff', 'create:sale')).toBe(true);
    expect(hasPermission('staff', 'adjust:stock')).toBe(true);
    expect(hasPermission('staff', 'create:product')).toBe(false);
    expect(hasPermission('staff', 'view:analytics')).toBe(false);
  });

  it('company can view analytics and employees, cannot manage sales or inventory', () => {
    expect(hasPermission('company', 'view:analytics')).toBe(true);
    expect(hasPermission('company', 'view:employees')).toBe(true);
    expect(hasPermission('company', 'create:sale')).toBe(false);
    expect(hasPermission('company', 'create:inventory')).toBe(false);
    expect(hasPermission('company', 'delete:product')).toBe(false);
  });

  it('manager has create:product and create:sale but not all admin permissions', () => {
    expect(hasPermission('manager', 'create:product')).toBe(true);
    expect(hasPermission('manager', 'create:sale')).toBe(true);
    expect(hasPermission('manager', 'view:analytics')).toBe(true);
  });

  it('test role has all permissions (demo role)', () => {
    expect(hasPermission('test', 'create:product')).toBe(true);
    expect(hasPermission('test', 'delete:product')).toBe(true);
    expect(hasPermission('test', 'view:audit')).toBe(true);
  });
});
