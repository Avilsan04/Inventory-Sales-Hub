import * as React from 'react';
import { setupHttpEvents } from '@core/http';
import { clearAuthCache } from '@core/api/queryClient';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { APP_ROUTES } from '@shared/config/routes';

// Must render inside BrowserRouter — registers global 401 handler that redirects to login.
export function HttpInterceptorSetup(): null {
  const { navigateTo } = useRoutingAdapter();
  const navigateRef = React.useRef<typeof navigateTo>(navigateTo);

  React.useEffect(() => {
    navigateRef.current = navigateTo;
  }, [navigateTo]);

  React.useEffect(() => {
    const cleanup = setupHttpEvents(() => {
      clearAuthCache();
      navigateRef.current(APP_ROUTES.LOGIN, true);
    });
    return cleanup;
  }, []);

  return null;
}
