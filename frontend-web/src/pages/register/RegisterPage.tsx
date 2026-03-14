import * as React from 'react';
import { PackageIcon, SunIcon, MoonIcon, CheckIcon } from 'lucide-react';

import { RegisterForm } from '@features/auth/components/RegisterForm';
import { useTheme } from '@shared/hooks/useTheme';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/pages/Register.module.scss';

const BRAND_FEATURE_KEYS = [
  'landing.features.realtime.title',
  'landing.features.collaboration.title',
  'landing.features.multiplatform.title',
] as const;

export function RegisterPage(): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();
  const { theme, toggleTheme } = useTheme();

  const handleRegisterSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  const handleNavigateToLogin = React.useCallback((): void => {
    navigateTo(APP_ROUTES.LOGIN);
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
            <h1 className={styles.title}>{translate('auth.createAccount')}</h1>
            <p className={styles.subtitle}>{translate('auth.registerSubtitle')}</p>
          </div>

          <RegisterForm onSuccess={handleRegisterSuccess} />

          <p className={styles.loginPrompt}>
            {translate('auth.alreadyHaveAccount')}
            <button
              type="button"
              className={styles.loginLink}
              onClick={handleNavigateToLogin}
            >
              {translate('auth.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
