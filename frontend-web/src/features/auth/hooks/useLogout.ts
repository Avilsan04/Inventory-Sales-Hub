import * as React from 'react';
import { useDependencies } from '@shared/hooks/useDependencies';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { clearAllCache } from '@core/api/queryClient';
import { APP_ROUTES } from '@shared/config/routes';
import { deactivateDemoMode } from '../lib/demoMode';

const VIEW_MODE_KEY_PREFIX = 'ish.';
const VIEW_MODE_KEY_SUFFIX = '.viewMode';

function clearViewModeStorage(): void {
  try {
    const keys = Object.keys(sessionStorage).filter(
      (k) => k.startsWith(VIEW_MODE_KEY_PREFIX) && k.endsWith(VIEW_MODE_KEY_SUFFIX)
    );
    keys.forEach((k) => {
      sessionStorage.removeItem(k);
    });
  } catch {
    // sessionStorage unavailable — ignore
  }
}

export function useLogout(): () => void {
  const { authService } = useDependencies();
  const { navigateTo } = useRoutingAdapter();

  return React.useCallback((): void => {
    void authService.logout().then(() => {
      deactivateDemoMode();
      clearViewModeStorage();
      clearAllCache();
      navigateTo(APP_ROUTES.LOGIN, true);
    });
  }, [authService, navigateTo]);
}
