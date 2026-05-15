import * as React from 'react';
import { SunIcon, MoonIcon, ChevronDownIcon } from 'lucide-react';

import { LoginForm } from '@features/auth';
import { APP_ROUTES } from '@shared/config/routes';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useTheme } from '@shared/hooks/useTheme';
import { useLanguageAdapter, type Language } from '@shared/adapters/useLanguageAdapter';
import { Button } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Login.module.scss';

const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '/flags/en.svg' },
  { value: 'es', label: 'Español', flag: '/flags/es.svg' },
];

const LANGUAGE_MAP: Record<Language, { label: string; flag: string }> = {
  en: { label: 'English', flag: '/flags/en.svg' },
  es: { label: 'Español', flag: '/flags/es.svg' },
};

export function LoginPage(): React.ReactElement {
  const { navigateTo } = useRoutingAdapter();
  const { translate } = useTranslationAdapter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguageAdapter();
  const current = LANGUAGE_MAP[language];
  const [langOpen, setLangOpen] = React.useState(false);
  const langRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!langOpen) return;
    const handleOutside = (e: MouseEvent): void => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [langOpen]);

  const handleLoginSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  const handleBackToLanding = React.useCallback((): void => {
    navigateTo(APP_ROUTES.LANDING);
  }, [navigateTo]);

  return (
    <main className={styles['page']}>
      <div className={cn(styles['glassBlob'], styles['blob1'])} aria-hidden="true" />
      <div className={cn(styles['glassBlob'], styles['blob2'])} aria-hidden="true" />
      <div className={cn(styles['glassBlob'], styles['blob3'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p1'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p2'])} aria-hidden="true" />
      <div className={cn(styles['particle'], styles['p3'])} aria-hidden="true" />

      <header className={styles['header']}>
        <div className={styles['headerContent']}>
          <Button
            variant="ghost"
            className={styles['headerBrand']}
            onClick={handleBackToLanding}
            aria-label={translate('common.backToHome')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 56"
              className={styles['headerBrandSvg']}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <linearGradient id="ish-login-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2563eb" />
                  <stop offset="1" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <rect x="0" y="6" width="44" height="44" rx="10" fill="url(#ish-login-grad)" />
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
          </Button>

          <nav className={styles['headerActions']}>
            <div ref={langRef} className={styles['langContainer']}>
              <Button
                variant="ghost"
                className={styles['langBtn']}
                onClick={(): void => {
                  setLangOpen((o) => !o);
                }}
                aria-label={translate('common.switchLanguage')}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                <img src={current.flag} alt="" aria-hidden="true" className={styles['langFlag']} />
                <span>{language.toUpperCase()}</span>
                <ChevronDownIcon className={styles['langChevron']} aria-hidden="true" />
              </Button>
              {langOpen && (
                <div className={styles['langDropdown']} role="listbox">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.value}
                      role="option"
                      aria-selected={lang.value === language}
                      className={
                        lang.value === language
                          ? `${styles['langItem']} ${styles['langItemActive']}`
                          : styles['langItem']
                      }
                      onClick={() => {
                        if (lang.value !== language) toggleLanguage();
                        setLangOpen(false);
                      }}
                    >
                      <img
                        src={lang.flag}
                        alt=""
                        aria-hidden="true"
                        className={styles['langFlag']}
                      />
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={translate('common.toggleTheme')}
            >
              {resolvedTheme === 'dark' ? (
                <SunIcon aria-hidden="true" />
              ) : (
                <MoonIcon aria-hidden="true" />
              )}
            </Button>
          </nav>
        </div>
      </header>

      <div className={styles['container']}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </main>
  );
}
