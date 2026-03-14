import * as React from 'react';
import { PackageIcon, SunIcon, MoonIcon, CheckIcon } from 'lucide-react';

import { LoginForm } from '@features/auth/components/LoginForm';
import { useTheme } from '@shared/hooks/useTheme';
import { Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import styles from '@shared/styles/themes/pages/Login.module.scss';

const BRAND_FEATURE_KEYS = [
  'landing.features.inventory.title',
  'landing.features.analytics.title',
  'landing.features.security.title',
] as const;

export function LoginPage(): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();
  const { theme, toggleTheme } = useTheme();

  const handleLoginSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <div className={styles.brandPanelContent}>
          <div className={styles.brandPanelLogo}>
            <PackageIcon aria-hidden="true" className={styles.brandPanelIcon} />
            <span className={styles.brandPanelName}>{translate('common.appName')}</span>
          </div>

          <p className={styles.brandPanelTagline}>
            {translate('landing.hero.description')}
          </p>

          <ul className={styles.brandPanelFeatures}>
            {BRAND_FEATURE_KEYS.map((key) => (
              <li key={key} className={styles.brandPanelFeature}>
                <CheckIcon aria-hidden="true" />
                <span>{translate(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className={styles.formPanel}>
        <Button
          variant="ghost"
          size="icon"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={translate('common.toggleTheme')}
        >
          {theme === 'dark' ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
        </Button>

        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <PackageIcon aria-hidden="true" className={styles.logoIcon} />
              <span className={styles.logoText}>{translate('common.appName')}</span>
            </div>
            <h1 className={styles.title}>{translate('auth.login')}</h1>
            <p className={styles.subtitle}>{translate('auth.loginSubtitle')}</p>
          </div>

          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}
