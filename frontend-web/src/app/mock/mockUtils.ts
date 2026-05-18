import { HttpResponse, type DefaultBodyType } from 'msw';
import type { UserRole } from '@features/auth';
import { hasPermission, type Permission } from '@shared/lib/permissions';

export const DEFAULT_TENANT = 'tenant-dev-001';

const TENANT_BUCKETS = new Map<string, unknown>();

const MOCK_TOKEN_ROLE: Record<string, UserRole> = {
  'mock-token-admin-001': 'admin',
  'mock-token-customer-002': 'customer',
  'mock-token-test-003': 'test',
  'mock-token-company-004': 'company',
};

/**
 * Reads X-Tenant-ID from a mock request and warns if absent.
 * In production the real API enforces tenant scoping; mocks warn to surface missing headers early.
 */
export function resolveTenant(request: Request): string {
  const tenantId = request.headers.get('X-Tenant-ID');
  if (!tenantId) {
    console.warn(
      '[MSW] X-Tenant-ID header missing on',
      request.method,
      new URL(request.url).pathname,
      '— verify interceptors are attached before the request fires.'
    );
  }
  return tenantId ?? DEFAULT_TENANT;
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Returns a tenant-scoped bucket for the requested key.
 * The initial data is deep-cloned so tenants never share mutable state.
 */
export function getTenantBucket<T>(tenantId: string, key: string, seed: () => T): T {
  const bucketKey = `${tenantId}:${key}`;
  if (!TENANT_BUCKETS.has(bucketKey)) {
    TENANT_BUCKETS.set(bucketKey, deepClone(seed()));
  }
  return TENANT_BUCKETS.get(bucketKey) as T;
}

function getRoleFromRequest(request: Request): UserRole | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  return MOCK_TOKEN_ROLE[token] ?? null;
}

/**
 * Returns a 403 HttpResponse if the requester's mock role lacks the permission.
 * Uses the single-source-of-truth from permissions.ts — no duplicate matrices.
 * Returns null if authorized (caller should proceed normally).
 */
export function requirePermission(
  request: Request,
  permission: Permission
): HttpResponse<DefaultBodyType> | null {
  const role = getRoleFromRequest(request);
  if (!role) return new HttpResponse(null, { status: 401 });
  if (!hasPermission(role, permission)) {
    return new HttpResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
