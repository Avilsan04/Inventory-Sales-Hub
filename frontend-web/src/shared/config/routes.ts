export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  // Future routes go here
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];