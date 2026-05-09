import { HttpResponse, type DefaultBodyType } from 'msw';

export const DEFAULT_TENANT = 'tenant-dev-001';

const TENANT_BUCKETS = new Map<string, unknown>();

const ALL_MOCK_PERMISSIONS = [
  'create:product',
  'delete:product',
  'create:inventory',
  'adjust:stock',
  'view:employees',
  'create:employee',
  'view:analytics',
  'create:sale',
  'manage:suppliers',
  'export:csv',
  'view:audit',
  'open:cash-session',
  'close:cash-session',
  'manage:warehouses',
  'transfer:stock',
] as const;

type MockPermission = (typeof ALL_MOCK_PERMISSIONS)[number];

type MockRole = 'admin' | 'manager' | 'staff' | 'customer' | 'company' | 'test';

const MOCK_TOKEN_ROLE: Record<string, MockRole> = {
  'mock-token-admin-001': 'admin',
  'mock-token-customer-002': 'customer',
  'mock-token-test-003': 'test',
  'mock-token-company-004': 'company',
};

const MOCK_ROLE_PERMISSIONS: Record<MockRole, ReadonlyArray<MockPermission>> = {
  admin: ALL_MOCK_PERMISSIONS,
  test: ALL_MOCK_PERMISSIONS,
  manager: [
    'create:product',
    'delete:product',
    'create:inventory',
    'adjust:stock',
    'view:employees',
    'create:employee',
    'view:analytics',
    'create:sale',
    'manage:suppliers',
    'export:csv',
    'open:cash-session',
    'close:cash-session',
    'manage:warehouses',
    'transfer:stock',
  ],
  staff: [
    'adjust:stock',
    'create:sale',
    'open:cash-session',
    'close:cash-session',
    'transfer:stock',
  ],
  company: ['view:analytics', 'view:employees', 'view:audit', 'manage:suppliers', 'export:csv'],
  customer: [],
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

function getRoleFromRequest(request: Request): MockRole | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  return MOCK_TOKEN_ROLE[token] ?? null;
}

/**
 * Returns a 403 HttpResponse if the requester's mock role lacks the permission.
 * Returns null if authorized (caller should proceed normally).
 */
export function requirePermission(
  request: Request,
  permission: MockPermission
): HttpResponse<DefaultBodyType> | null {
  const role = getRoleFromRequest(request);
  if (!role) return new HttpResponse(null, { status: 401 });
  const perms = MOCK_ROLE_PERMISSIONS[role] as ReadonlyArray<string>;
  if (!perms.includes(permission)) {
    return new HttpResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
