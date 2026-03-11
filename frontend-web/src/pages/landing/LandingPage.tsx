import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SunIcon, MoonIcon } from 'lucide-react';

import { useTheme } from '@shared/hooks/useTheme';
import { Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';

import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { StatsSection } from './sections/StatsSection';
import { CTASection } from './sections/CTASection';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

export function LandingPage(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleNavigateToLogin = React.useCallback((): void => {
    void navigate(APP_ROUTES.LOGIN);
  }, [navigate]);

  return (
    <div className={styles['page']}>
      <header className={styles['navbar']}>
        <div className={styles['navbarContent']}>
          <span className={styles['navbarBrand']}>{t('common.appName')}</span>
          <div className={styles['navbarActions']}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={t('common.toggleTheme')}
            >
              {theme === 'dark' ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNavigateToLogin}>
              {t('auth.login')}
            </Button>
          </div>
        </div>
      </header>

      <main className={styles['main']}>
        <HeroSection onGetStarted={handleNavigateToLogin} />
        <FeaturesSection />
        <StatsSection />
        <CTASection onGetStarted={handleNavigateToLogin} />
      </main>

      <footer className={styles['footer']}>
        <p className={styles['footerText']}>
          &copy; {new Date().getFullYear()} {t('common.appName')}.{' '}
          {t('landing.footer.rights')}
        </p>
      </footer>
    </div>
  );
}
