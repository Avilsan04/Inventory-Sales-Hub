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
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@features/auth/models/auth.types';
import { APP_ROUTES } from '@shared/config/routes';

export interface RouteMeta {
  title: string;
  Icon: LucideIcon;
  roles?: ReadonlyArray<UserRole>;
}

export const ROUTE_META: Readonly<Record<string, RouteMeta>> = {
  [APP_ROUTES.DASHBOARD]: { title: 'Dashboard', Icon: LayoutDashboardIcon },
  [APP_ROUTES.INVENTORY]: {
    title: 'Inventario',
    Icon: PackageIcon,
    roles: ['admin', 'manager', 'staff', 'test'],
  },
  [APP_ROUTES.PRODUCTS]: {
    title: 'Productos',
    Icon: PackageIcon,
    roles: ['admin', 'manager', 'staff', 'test'],
  },
  [APP_ROUTES.SALES]: {
    title: 'Ventas',
    Icon: ShoppingCartIcon,
    roles: ['admin', 'manager', 'staff', 'test'],
  },
  [APP_ROUTES.CUSTOMERS]: {
    title: 'Clientes',
    Icon: UsersIcon,
    roles: ['admin', 'manager', 'staff', 'test'],
  },
  [APP_ROUTES.EMPLOYEES]: {
    title: 'Empleados',
    Icon: UserCogIcon,
    roles: ['admin', 'manager', 'company', 'test'],
  },
  [APP_ROUTES.SUPPLIERS]: {
    title: 'Proveedores',
    Icon: TruckIcon,
    roles: ['admin', 'manager', 'test'],
  },
  [APP_ROUTES.ANALYTICS]: {
    title: 'Analytics',
    Icon: BarChart2Icon,
    roles: ['admin', 'manager', 'company', 'test'],
  },
  [APP_ROUTES.NOTIFICATIONS]: { title: 'Notificaciones', Icon: BellIcon },
  [APP_ROUTES.PROFILE]: { title: 'Perfil', Icon: UserIcon },
  [APP_ROUTES.SETTINGS]: { title: 'Ajustes', Icon: SettingsIcon },
  [APP_ROUTES.ADMIN_TENANTS]: {
    title: 'Tenants',
    Icon: BuildingIcon,
    roles: ['admin', 'company', 'test'],
  },
  [APP_ROUTES.CATALOG]: {
    title: 'Catálogo',
    Icon: ShoppingBagIcon,
    roles: ['customer', 'test'],
  },
  [APP_ROUTES.MY_ORDERS]: {
    title: 'Mis Pedidos',
    Icon: ClipboardListIcon,
    roles: ['customer', 'test'],
  },
  [APP_ROUTES.POS]: {
    title: 'Punto de Venta',
    Icon: ScanBarcodeIcon,
    roles: ['admin', 'manager', 'staff', 'customer', 'test'],
  },
} as const;
