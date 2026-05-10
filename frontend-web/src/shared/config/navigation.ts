import { APP_ROUTES } from './routes';

export type NavIconKey =
  | 'dashboard'
  | 'analytics'
  | 'inventory'
  | 'products'
  | 'sales'
  | 'pos'
  | 'myOrders'
  | 'catalog'
  | 'customers'
  | 'employees'
  | 'shipments'
  | 'notifications'
  | 'tenants'
  | 'audit'
  | 'settings'
  | 'profile';

export interface NavItem {
  readonly to: string;
  readonly labelKey: string;
  readonly iconKey: NavIconKey;
}

export interface NavGroup {
  readonly labelKey?: string;
  readonly items: readonly NavItem[];
}

// Mirrors UserRole — kept local to avoid shared→features import violation.
export type NavRole = 'company' | 'admin' | 'manager' | 'staff' | 'customer' | 'test';

const CUSTOMER_NAV_GROUPS: readonly NavGroup[] = [
  {
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.CATALOG, labelKey: 'nav.catalog', iconKey: 'catalog' },
      { to: APP_ROUTES.POS, labelKey: 'nav.pos', iconKey: 'pos' },
      { to: APP_ROUTES.MY_ORDERS, labelKey: 'nav.myOrders', iconKey: 'myOrders' },
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
];

const COMPANY_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.overview',
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.ANALYTICS, labelKey: 'nav.analytics', iconKey: 'analytics' },
    ],
  },
  {
    labelKey: 'nav.section.operations',
    items: [
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.EMPLOYEES, labelKey: 'nav.employees', iconKey: 'employees' },
      { to: APP_ROUTES.SUPPLIERS, labelKey: 'nav.shipments', iconKey: 'shipments' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.ADMIN_TENANTS, labelKey: 'nav.tenants', iconKey: 'tenants' },
      { to: APP_ROUTES.AUDIT, labelKey: 'nav.audit', iconKey: 'audit' },
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
];

const ADMIN_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.overview',
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.ANALYTICS, labelKey: 'nav.analytics', iconKey: 'analytics' },
    ],
  },
  {
    labelKey: 'nav.section.operations',
    items: [
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory', iconKey: 'inventory' },
      { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers', iconKey: 'customers' },
      { to: APP_ROUTES.EMPLOYEES, labelKey: 'nav.employees', iconKey: 'employees' },
      { to: APP_ROUTES.SUPPLIERS, labelKey: 'nav.shipments', iconKey: 'shipments' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.ADMIN_TENANTS, labelKey: 'nav.tenants', iconKey: 'tenants' },
      { to: APP_ROUTES.AUDIT, labelKey: 'nav.audit', iconKey: 'audit' },
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
];

const MANAGER_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.overview',
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.ANALYTICS, labelKey: 'nav.analytics', iconKey: 'analytics' },
    ],
  },
  {
    labelKey: 'nav.section.operations',
    items: [
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory', iconKey: 'inventory' },
      { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers', iconKey: 'customers' },
      { to: APP_ROUTES.EMPLOYEES, labelKey: 'nav.employees', iconKey: 'employees' },
      { to: APP_ROUTES.SUPPLIERS, labelKey: 'nav.shipments', iconKey: 'shipments' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
];

const STAFF_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.overview',
    items: [{ to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' }],
  },
  {
    labelKey: 'nav.section.operations',
    items: [
      { to: APP_ROUTES.POS, labelKey: 'nav.pos', iconKey: 'pos' },
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory', iconKey: 'inventory' },
      { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers', iconKey: 'customers' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
];

export const NAV_GROUPS_BY_ROLE: Record<NavRole, readonly NavGroup[]> = {
  customer: CUSTOMER_NAV_GROUPS,
  company: COMPANY_NAV_GROUPS,
  admin: ADMIN_NAV_GROUPS,
  manager: MANAGER_NAV_GROUPS,
  staff: STAFF_NAV_GROUPS,
  test: ADMIN_NAV_GROUPS,
};

export const FOOTER_NAV_GROUP: NavGroup = {
  items: [
    { to: APP_ROUTES.PROFILE, labelKey: 'nav.profile', iconKey: 'profile' },
    { to: APP_ROUTES.SETTINGS, labelKey: 'nav.settings', iconKey: 'settings' },
  ],
};
