import { tenantStorage } from '@core/storage/tenantStorage';

/**
 * Returns the current tenant ID used to namespace query keys.
 * Falls back to 'global' so keys remain valid when tenantId is not yet set.
 */
export function getTenantScope(): string {
  return tenantStorage.getTenantId() ?? 'global';
}

/**
 * Wraps a base query key array with a tenant prefix.
 * Use in key factories for all tenant-scoped domains
 * (sales, inventory, customers, employees, products, suppliers).
 *
 * @example
 * const saleKeys = {
 *   lists: () => withTenant(['sales', 'list']) as const,
 * };
 */
export function withTenant<T extends readonly unknown[]>(base: T): [string, ...T] {
  return [getTenantScope(), ...base];
}
