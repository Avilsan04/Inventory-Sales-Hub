import * as React from 'react';

import { LoginForm } from '@features/auth/components/LoginForm';
import { APP_ROUTES } from '@shared/config/routes';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import styles from '@shared/styles/themes/pages/Login.module.scss';

export function LoginPage(): React.ReactElement {
  const { navigateTo } = useRoutingAdapter();

  const handleLoginSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  return (
    <div className={styles['page']}>
      <div className={styles['container']}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
