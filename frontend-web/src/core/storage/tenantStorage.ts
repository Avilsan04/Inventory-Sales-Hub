import { APP_ENV } from '@core/config/env';

// Namespaced by Vite mode so dev/staging/prod never share the same key.
const TENANT_KEY = `ish.${APP_ENV}.tenant_id`;
const isBrowser = typeof window !== 'undefined';

export const tenantStorage = {
  getTenantId: (): string | null => {
    if (!isBrowser) return null;
    const value = window.localStorage.getItem(TENANT_KEY);
    // Guard against corrupted empty-string values to prevent silent 401 loops.
    return value !== null && value.trim().length > 0 ? value : null;
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
