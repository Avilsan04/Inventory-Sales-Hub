import { APP_ENV } from '@core/config/env';

// Namespaced by Vite mode so dev/staging/prod never share the same key.
const TENANT_KEY = `ish.${APP_ENV}.tenant_id`;
const isBrowser = typeof window !== 'undefined';

export const tenantStorage = {
  getTenantId: (): string | null => {
    if (!isBrowser) return null;
    return window.localStorage.getItem(TENANT_KEY);
  },

  setTenantId: (id: string): void => {
    if (!isBrowser) return;
    window.localStorage.setItem(TENANT_KEY, id);
  },

  removeTenantId: (): void => {
    if (!isBrowser) return;
    window.localStorage.removeItem(TENANT_KEY);
  },
};
