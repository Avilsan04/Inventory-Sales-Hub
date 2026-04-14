import * as React from 'react';
import { useDependencies } from '@shared/hooks/useDependencies';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { APP_ROUTES } from '@shared/config/routes';

export function useLogout(): () => void {
  const { authService } = useDependencies();
  const { navigateTo } = useRoutingAdapter();

  return React.useCallback((): void => {
    void authService.logout().then(() => {
      navigateTo(APP_ROUTES.LOGIN, true);
    });
  }, [authService, navigateTo]);
}
