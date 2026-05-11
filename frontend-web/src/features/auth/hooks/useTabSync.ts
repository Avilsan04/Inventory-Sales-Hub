import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeTabSync } from '@shared/lib/tabSync';
import { clearAuthCache, clearAllCache } from '@core/api/queryClient';
import { APP_ROUTES } from '@shared/config/routes';

/**
 * Listens for cross-tab auth/tenant events and syncs local state.
 * Mount once at the app root (inside BrowserRouter).
 */
export function useTabSync(): void {
  const navigate = useNavigate();

  React.useEffect(() => {
    return subscribeTabSync((message) => {
      switch (message.type) {
        case 'AUTH_LOGOUT':
          clearAuthCache();
          void navigate(APP_ROUTES.LOGIN, { replace: true });
          break;
        case 'TENANT_CHANGED':
          clearAllCache();
          break;
        case 'CART_UPDATED':
          // Cart uses Zustand with localStorage — trigger a re-read by reloading store
          window.dispatchEvent(new StorageEvent('storage', { key: 'ish-cart' }));
          break;
        case 'AUTH_LOGIN':
          // Another tab logged in — invalidate so this tab picks up the session
          clearAuthCache();
          break;
        default:
          break;
      }
    });
  }, [navigate]);
}
