import * as React from 'react';
import { PackageIcon, SunIcon, MoonIcon, GlobeIcon } from 'lucide-react';

import { useTheme } from '@shared/hooks/useTheme';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { useLanguageAdapter } from '@shared/adapters/useLanguageAdapter';
import { Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';

import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { AnalyticsSection } from './sections/AnalyticsSection';
import { TrustedBySection } from './sections/TrustedBySection';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

const CURRENT_YEAR = new Date().getFullYear();

export function LandingPage(): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguageAdapter();

  const handleNavigateToLogin = React.useCallback((): void => {
    navigateTo(APP_ROUTES.LOGIN);
  }, [navigateTo]);

  const handleNavigateToRegister = React.useCallback((): void => {
    navigateTo(APP_ROUTES.REGISTER);
  }, [navigateTo]);

  const handleScrollToTop = React.useCallback((e: React.MouseEvent | React.KeyboardEvent): void => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles['page']}>
      <header className={styles['navbar']}>
        <div className={styles['navbarContent']}>
          <button
            type="button"
            className={styles['navbarBrand']}
            onClick={handleScrollToTop}
            aria-label={translate('common.scrollToTop')}
          >
            <PackageIcon aria-hidden="true" />
            <span>{translate('common.appName')}</span>
          </button>

          <div className={styles['navbarActions']}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              aria-label={translate('common.switchLanguage')}
              className={styles['langButton']}
            >
              <GlobeIcon aria-hidden="true" />
              <span>{language === 'en' ? 'ES' : 'EN'}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={translate('common.toggleTheme')}
            >
              {theme === 'dark' ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNavigateToLogin}>
              {translate('auth.login')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNavigateToRegister}>
              {translate('auth.register')}
            </Button>
          </div>
        </div>
      </header>

      <main className={styles['main']}>
        <HeroSection onGetStarted={handleNavigateToLogin} />
        <FeaturesSection />
        <AnalyticsSection />
        <TrustedBySection />
      </main>

      <footer className={styles['footer']}>
        <p className={styles['footerText']}>
          &copy; {CURRENT_YEAR} {translate('common.appName')}.{' '}
          {translate('landing.footer.rights')}
        </p>
      </footer>
    </div>
  );
}
