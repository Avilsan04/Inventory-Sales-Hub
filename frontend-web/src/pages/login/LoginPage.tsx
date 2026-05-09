import * as React from 'react';
import { ArrowLeftIcon } from 'lucide-react';

import { LoginForm } from '@features/auth/components/LoginForm';
import { APP_ROUTES } from '@shared/config/routes';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
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
      <div className={`${styles['glassBlob']} ${styles['blob1']}`} aria-hidden="true" />
      <div className={`${styles['glassBlob']} ${styles['blob2']}`} aria-hidden="true" />
      <div className={`${styles['glassBlob']} ${styles['blob3']}`} aria-hidden="true" />
      <div className={`${styles['particle']} ${styles['p1']}`} aria-hidden="true" />
      <div className={`${styles['particle']} ${styles['p2']}`} aria-hidden="true" />
      <div className={`${styles['particle']} ${styles['p3']}`} aria-hidden="true" />

      <button
        type="button"
        className={styles['backBtn']}
        onClick={handleBackToLanding}
        aria-label={translate('nav.home')}
      >
        <ArrowLeftIcon size={16} aria-hidden="true" />
        {translate('nav.home')}
      </button>
      <div className={styles['container']}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
