import * as React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';

import { RegisterForm } from '@features/auth/components/RegisterForm';
import type { RegisterRole } from '@features/auth/models/auth.types';
import { BrandMark, Button } from '@shared/ui/primitives';
import { useTheme } from '@shared/hooks/useTheme';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { APP_ROUTES } from '@shared/config/routes';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Register.module.scss';

const TABS: ReadonlyArray<{ role: RegisterRole; labelKey: string }> = [
  { role: 'customer', labelKey: 'auth.tabUser' },
  { role: 'admin',    labelKey: 'auth.tabAdmin' },
  { role: 'company',  labelKey: 'auth.tabCompany' },
];

export function RegisterPage(): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = React.useState<RegisterRole>('customer');

  const handleRegisterSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  const handleNavigateToLogin = React.useCallback((): void => {
    navigateTo(APP_ROUTES.LOGIN);
  }, [navigateTo]);

  return (
    <div className={styles.page}>
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
          <div className={styles.logo}>
            <BrandMark size={40} />
            <span className={styles.logoText}>{translate('common.appName')}</span>
          </div>

          <div className={styles.tabs} role="tablist">
            {TABS.map(({ role, labelKey }) => (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={activeTab === role}
                className={cn(styles.tab, activeTab === role && styles.tabActive)}
                onClick={() => { setActiveTab(role); }}
              >
                {translate(labelKey)}
              </button>
            ))}
          </div>

          <RegisterForm key={activeTab} role={activeTab} onSuccess={handleRegisterSuccess} />

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
