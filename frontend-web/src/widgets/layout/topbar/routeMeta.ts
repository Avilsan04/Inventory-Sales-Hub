import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  UserCogIcon,
  TruckIcon,
  BarChart2Icon,
  BellIcon,
  UserIcon,
  SettingsIcon,
  BuildingIcon,
  ShoppingBagIcon,
  ClipboardListIcon,
  ScanBarcodeIcon,
  ScrollTextIcon,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@features/auth/models/auth.types';
import { APP_ROUTES } from '@shared/config/routes';

export interface RouteMeta {
  labelKey: string;
  Icon: LucideIcon;
  roles?: ReadonlyArray<UserRole>;
}

export const ROUTE_META: Readonly<Record<string, RouteMeta>> = {
  [APP_ROUTES.DASHBOARD]: { labelKey: 'nav.dashboard', Icon: LayoutDashboardIcon },
  [APP_ROUTES.INVENTORY]: {
    labelKey: 'nav.inventory',
    Icon: PackageIcon,
    roles: ['admin', 'manager', 'staff', 'test'],
  },
  [APP_ROUTES.PRODUCTS]: {
    labelKey: 'nav.products',
    Icon: PackageIcon,
    roles: ['admin', 'manager', 'staff', 'test'],
  },
  [APP_ROUTES.SALES]: {
    labelKey: 'nav.sales',
    Icon: ShoppingCartIcon,
    roles: ['admin', 'manager', 'staff', 'test'],
  },
  [APP_ROUTES.CUSTOMERS]: {
    labelKey: 'nav.customers',
    Icon: UsersIcon,
    roles: ['admin', 'manager', 'staff', 'test'],
  },
  [APP_ROUTES.EMPLOYEES]: {
    labelKey: 'nav.employees',
    Icon: UserCogIcon,
    roles: ['admin', 'manager', 'company', 'test'],
  },
  [APP_ROUTES.SUPPLIERS]: {
    labelKey: 'nav.suppliers',
    Icon: TruckIcon,
    roles: ['admin', 'manager', 'test'],
  },
  [APP_ROUTES.ANALYTICS]: {
    labelKey: 'nav.analytics',
    Icon: BarChart2Icon,
    roles: ['admin', 'manager', 'company', 'test'],
  },
  [APP_ROUTES.NOTIFICATIONS]: { labelKey: 'nav.notifications', Icon: BellIcon },
  [APP_ROUTES.PROFILE]: { labelKey: 'nav.profile', Icon: UserIcon },
  [APP_ROUTES.SETTINGS]: { labelKey: 'nav.settings', Icon: SettingsIcon },
  [APP_ROUTES.ADMIN_TENANTS]: {
    labelKey: 'nav.tenants',
    Icon: BuildingIcon,
    roles: ['admin', 'company', 'test'],
  },
  [APP_ROUTES.CATALOG]: {
    labelKey: 'nav.catalog',
    Icon: ShoppingBagIcon,
    roles: ['customer', 'test'],
  },
  [APP_ROUTES.MY_ORDERS]: {
    labelKey: 'nav.myOrders',
    Icon: ClipboardListIcon,
    roles: ['customer', 'test'],
  },
  [APP_ROUTES.POS]: {
    labelKey: 'nav.pos',
    Icon: ScanBarcodeIcon,
    roles: ['admin', 'manager', 'staff', 'customer', 'test'],
  },
  [APP_ROUTES.AUDIT]: {
    labelKey: 'nav.audit',
    Icon: ScrollTextIcon,
    roles: ['admin', 'company', 'test'],
  },
} as const;
