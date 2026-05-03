export type Permission =
  | 'create:product'
  | 'delete:product'
  | 'create:inventory'
  | 'adjust:stock'
  | 'view:employees'
  | 'create:employee'
  | 'view:analytics'
  | 'create:sale'
  | 'manage:suppliers'
  | 'export:csv'
  | 'view:audit'
  | 'open:cash-session'
  | 'close:cash-session'
  | 'manage:warehouses'
  | 'transfer:stock';

type PermissionRole = 'admin' | 'manager' | 'staff' | 'customer' | 'company';

const ALL_PERMISSIONS: ReadonlyArray<Permission> = [
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
];

const PERMISSIONS: Readonly<Record<PermissionRole, ReadonlyArray<Permission>>> = {
  admin: ALL_PERMISSIONS,
  company: ALL_PERMISSIONS,
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
  customer: [],
};

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role || !(role in PERMISSIONS)) return false;
  return PERMISSIONS[role as PermissionRole].includes(permission);
}
