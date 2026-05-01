import * as React from 'react';
import { useDependencies } from '@shared/hooks/useDependencies';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { clearAuthCache } from '@core/api/queryClient';
import { APP_ROUTES } from '@shared/config/routes';

export function useLogout(): () => void {
  const { authService } = useDependencies();
  const { navigateTo } = useRoutingAdapter();

  return React.useCallback((): void => {
    void authService.logout().then(() => {
      clearAuthCache();
      navigateTo(APP_ROUTES.LOGIN, true);
    });
  }, [authService, navigateTo]);
}
