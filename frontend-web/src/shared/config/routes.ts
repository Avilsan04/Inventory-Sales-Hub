/**
 * Single Source of Truth for application routes.
 */
export const APP_ROUTES = {
  ROOT: '/',
  LANDING: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];