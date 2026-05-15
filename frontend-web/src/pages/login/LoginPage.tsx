import * as React from 'react';

import { LoginForm } from '@features/auth';
import { APP_ROUTES } from '@shared/config/routes';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { cn } from '@shared/lib/cn';
import { AuthPageHeader } from '@shared/ui/composed';
import styles from '@shared/styles/themes/pages/Login.module.scss';

export function LoginPage(): React.ReactElement {
  const { navigateTo } = useRoutingAdapter();

  const handleLoginSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  const handleBackToLanding = React.useCallback((): void => {
    navigateTo(APP_ROUTES.LANDING);
  }, [navigateTo]);

  return (
    <main className={styles['page']}>
      <div className={cn(styles['glassBlob'], styles['blob1'])} aria-hidden="true" />
      <div className={cn(styles['glassBlob'], styles['blob2'])} aria-hidden="true" />
      <div className={cn(styles['glassBlob'], styles['blob3'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p1'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p2'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p3'])} aria-hidden="true" />

      <AuthPageHeader onLogoClick={handleBackToLanding} />

      <div className={styles['container']}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </main>
  );
}
