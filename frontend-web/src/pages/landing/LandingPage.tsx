import * as React from 'react';
import { SunIcon, MoonIcon, ChevronDownIcon } from 'lucide-react';

import { useTheme } from '@shared/hooks/useTheme';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { useLanguageAdapter, type Language } from '@shared/adapters/useLanguageAdapter';
import { Button } from '@shared/ui/primitives';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/ui/composed';
import { APP_ROUTES } from '@shared/config/routes';
import { activateDemoMode } from '@features/auth/lib/demoMode';

import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { AnalyticsSection } from './sections/AnalyticsSection';
import { TrustedBySection } from './sections/TrustedBySection';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '/flags/en.svg' },
  { value: 'es', label: 'Español', flag: '/flags/es.svg' },
];

const LANGUAGE_MAP: Record<Language, { label: string; flag: string }> = {
  en: { label: 'English', flag: '/flags/en.svg' },
  es: { label: 'Español', flag: '/flags/es.svg' },
};

const CURRENT_YEAR = new Date().getFullYear();

export function LandingPage(): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguageAdapter();
  const current = LANGUAGE_MAP[language];
  const handleNavigateToLogin = React.useCallback((): void => {
    navigateTo(APP_ROUTES.LOGIN);
  }, [navigateTo]);

  const handleTestMode = React.useCallback((): void => {
    activateDemoMode();
  }, []);

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 56"
              style={{ width: '236px', height: '44px', flexShrink: 0 }}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <linearGradient id="ish-nav-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2563eb" />
                  <stop offset="1" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <rect x="0" y="6" width="44" height="44" rx="10" fill="url(#ish-nav-grad)" />
              <rect
                x="0.5"
                y="6.5"
                width="43"
                height="43"
                rx="9.5"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.14"
              />
              <g stroke="#ffffff" strokeWidth="1.1" strokeLinejoin="round">
                <path d="M7 34 L13 31 L19 34 L13 37 Z" fill="#ffffff" fillOpacity="0.95" />
                <path d="M7 34 L7 40 L13 43 L13 37 Z" fill="#ffffff" fillOpacity="0.55" />
                <path d="M19 34 L19 40 L13 43 L13 37 Z" fill="#ffffff" fillOpacity="0.75" />
                <path d="M15 26 L22 23 L29 26 L22 29 Z" fill="#ffffff" fillOpacity="0.95" />
                <path d="M15 26 L15 34 L22 37 L22 29 Z" fill="#ffffff" fillOpacity="0.55" />
                <path d="M29 26 L29 34 L22 37 L22 29 Z" fill="#ffffff" fillOpacity="0.75" />
                <path d="M25 17 L31 14 L37 17 L31 20 Z" fill="#ffffff" fillOpacity="0.95" />
                <path d="M25 17 L25 23 L31 26 L31 20 Z" fill="#ffffff" fillOpacity="0.55" />
                <path d="M37 17 L37 23 L31 26 L31 20 Z" fill="#ffffff" fillOpacity="0.75" />
              </g>
              <circle cx="35" cy="13" r="1.7" fill="#22d3ee" />
              <text
                x="56"
                y="32"
                fontFamily="Inter, -apple-system, sans-serif"
                fontWeight="700"
                fontSize="18"
                letterSpacing="-0.4"
                style={{ fill: 'var(--color-text-primary)' }}
              >
                Inventory
              </text>
              <text
                x="152"
                y="32"
                fontFamily="Inter, -apple-system, sans-serif"
                fontWeight="400"
                fontSize="18"
                letterSpacing="-0.4"
                style={{ fill: 'var(--color-text-secondary)' }}
              >
                Sales Hub
              </text>
              <line
                x1="56"
                y1="40"
                x2="240"
                y2="40"
                strokeWidth="1"
                style={{ stroke: 'var(--color-border)' }}
              />
              <text
                x="56"
                y="50"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="500"
                fontSize="9"
                letterSpacing="2"
                style={{ fill: 'var(--color-text-muted)' }}
              >
                STOCK · ORDERS · SALES
              </text>
            </svg>
          </button>

          <div className={styles['navbarActions']}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={styles['langBtn']}
                  aria-label={translate('common.switchLanguage')}
                >
                  <img src={current.flag} alt={current.label} className={styles['langFlag']} />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDownIcon className={styles['langChevron']} aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ minWidth: '130px' }}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <DropdownMenuItem
                    key={lang.value}
                    onClick={() => {
                      if (lang.value !== language) toggleLanguage();
                    }}
                    className={lang.value === language ? styles['langItemActive'] : undefined}
                  >
                    <img src={lang.flag} alt={lang.label} className={styles['langFlag']} />
                    <span>{lang.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
          </div>
        </div>
      </header>

      <main className={styles['main']}>
        <HeroSection onGetStarted={handleNavigateToLogin} onTestMode={handleTestMode} />
        <FeaturesSection />
        <AnalyticsSection />
        <TrustedBySection />
      </main>

      <footer className={styles['footer']}>
        <p className={styles['footerText']}>
          &copy; {CURRENT_YEAR} {translate('common.appName')}. {translate('landing.footer.rights')}
        </p>
      </footer>
    </div>
  );
}
