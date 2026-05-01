export const APP_ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  PRODUCTS: '/products',
  SALES: '/sales',
  CUSTOMERS: '/customers',
  EMPLOYEES: '/employees',
  SUPPLIERS: '/suppliers',
  ANALYTICS: '/analytics',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN_TENANTS: '/admin/tenants',
  CATALOG: '/catalog',
  MY_ORDERS: '/my-orders',
  POS: '/pos',
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
