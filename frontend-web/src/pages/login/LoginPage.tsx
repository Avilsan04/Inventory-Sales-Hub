import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PackageIcon, SunIcon, MoonIcon } from 'lucide-react';

import { LoginForm } from '@features/auth/components/LoginForm';
import { useTheme } from '@shared/hooks/useTheme';
import { Button } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Login.module.scss';

export function LoginPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLoginSuccess = (): void => {
    void navigate('/', { replace: true });
  };

  return (
    <div className={styles.page}>
      <Button
        variant="ghost"
        size="icon"
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={t('common.toggleTheme')}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </Button>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <PackageIcon className={styles.logoIcon} />
            <span className={styles.logoText}>{t('common.appName')}</span>
          </div>
          <h1 className={styles.title}>{t('auth.login')}</h1>
          <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}