import * as React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';

import { LoginForm } from '@features/auth/components/LoginForm';
import { useTheme } from '@shared/hooks/useTheme';
import { Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import styles from '@shared/styles/themes/pages/Login.module.scss';

export function LoginPage(): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();
  const { theme, toggleTheme } = useTheme();

  const handleLoginSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  return (
    <div className={styles['page']}>
      <Button
        variant="ghost"
        size="icon"
        className={styles['themeToggle']}
        onClick={toggleTheme}
        aria-label={translate('common.toggleTheme')}
      >
        {theme === 'dark' ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
      </Button>

      <div className={styles['container']}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
