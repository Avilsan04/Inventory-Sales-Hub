import * as React from 'react';
import { ArrowLeftIcon } from 'lucide-react';

import { LoginForm } from '@features/auth';
import { APP_ROUTES } from '@shared/config/routes';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Login.module.scss';

export function LoginPage(): React.ReactElement {
  const { navigateTo } = useRoutingAdapter();
  const { translate } = useTranslationAdapter();

  const handleLoginSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  const handleBackToLanding = React.useCallback((): void => {
    navigateTo(APP_ROUTES.LANDING);
  }, [navigateTo]);

  return (
    <div className={styles['page']}>
      <div className={cn(styles['glassBlob'], styles['blob1'])} aria-hidden="true" />
      <div className={cn(styles['glassBlob'], styles['blob2'])} aria-hidden="true" />
      <div className={cn(styles['glassBlob'], styles['blob3'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p1'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p2'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p3'])} aria-hidden="true" />

      <Button
        variant="ghost"
        className={styles['backBtn']}
        onClick={handleBackToLanding}
        aria-label={translate('nav.home')}
      >
        <ArrowLeftIcon size={16} aria-hidden="true" />
        {translate('nav.home')}
      </Button>
      <div className={styles['container']}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
