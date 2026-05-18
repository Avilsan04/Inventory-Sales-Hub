import type { UserRole } from '@features/auth';

export type Permission =
  | 'create:product'
  | 'delete:product'
  | 'create:inventory'
  | 'adjust:stock'
  | 'view:employees'
  | 'create:employee'
  | 'delete:employee'
  | 'view:analytics'
  | 'create:sale'
  | 'manage:suppliers'
  | 'export:csv'
  | 'view:audit'
  | 'open:cash-session'
  | 'close:cash-session'
  | 'manage:warehouses'
  | 'transfer:stock';

const ALL_PERMISSIONS: ReadonlyArray<Permission> = [
  'create:product',
  'delete:product',
  'create:inventory',
  'adjust:stock',
  'view:employees',
  'create:employee',
  'delete:employee',
  'view:analytics',
  'create:sale',
  'manage:suppliers',
  'export:csv',
  'view:audit',
  'open:cash-session',
  'close:cash-session',
  'manage:warehouses',
  'transfer:stock',
];

const PERMISSIONS: Readonly<Record<UserRole, ReadonlyArray<Permission>>> = {
  admin: ALL_PERMISSIONS,
  // company can view analytics, employees, audit and manage suppliers — no POS or stock ops.
  company: [
    'view:analytics',
    'view:employees',
    'delete:employee',
    'view:audit',
    'manage:suppliers',
    'export:csv',
  ],
  manager: [
    'create:product',
    'delete:product',
    'create:inventory',
    'adjust:stock',
    'view:employees',
    'create:employee',
    'delete:employee',
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
  customer: [],
  // test role has all permissions to simulate any role during development/demo.
  test: ALL_PERMISSIONS,
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS[role].includes(permission);
}
