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
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];