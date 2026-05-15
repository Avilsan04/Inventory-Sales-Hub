import * as React from 'react';
import { MoonIcon, SunIcon, ChevronDownIcon, MenuIcon, CheckIcon } from 'lucide-react';
import { useTheme } from '@shared/hooks/useTheme';
import { useClickOutside } from '@shared/hooks/useClickOutside';
import { useLanguageAdapter, type Language } from '@shared/adapters/useLanguageAdapter';
import { useCurrencyAdapter, CURRENCY_OPTIONS } from '@shared/adapters/useCurrencyAdapter';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/TopBar.module.scss';
import { PageTitle } from './topbar/PageTitle';
import { CommandPalette } from './topbar/CommandPalette';
import { QuickActionBtn } from './topbar/QuickActionBtn';
import { CartButton } from './topbar/CartButton';
import { NotificationPanel } from './topbar/NotificationPanel';
import { UserMenu } from './topbar/UserMenu';

const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '/flags/en.svg' },
  { value: 'es', label: 'Español', flag: '/flags/es.svg' },
];

const LANGUAGE_MAP: Record<Language, { label: string; flag: string }> = {
  en: { label: 'English', flag: '/flags/en.svg' },
  es: { label: 'Español', flag: '/flags/es.svg' },
};

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps): React.ReactElement {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguageAdapter();
  const { currency, setCurrency } = useCurrencyAdapter();
  const { translate: t } = useTranslationAdapter();

  const [langOpen, setLangOpen] = React.useState(false);
  const [currencyOpen, setCurrencyOpen] = React.useState(false);

  const langRef = React.useRef<HTMLDivElement>(null);
  const currencyRef = React.useRef<HTMLDivElement>(null);

  const closeLang = React.useCallback(() => {
    setLangOpen(false);
  }, []);
  const closeCurrency = React.useCallback(() => {
    setCurrencyOpen(false);
  }, []);

  useClickOutside(langRef, closeLang, langOpen);
  useClickOutside(currencyRef, closeCurrency, currencyOpen);

  const currentLang = LANGUAGE_MAP[language];
  const currentCurrency = CURRENCY_OPTIONS.find((o) => o.value === currency) ?? {
    value: currency,
    label: currency,
    symbol: currency,
  };

  return (
    <header className={styles['topbar']}>
      <div className={styles['topbarLeft']}>
        {onToggleSidebar !== undefined && (
          <Button
            variant="ghost"
            className={styles['menuBtn']}
            onClick={onToggleSidebar}
            aria-label={t('common.openMenu')}
          >
            <MenuIcon aria-hidden="true" />
          </Button>
        )}
        <PageTitle />
      </div>

      <div className={styles['topbarCenter']}>
        <CommandPalette />
      </div>

      <div className={styles['topbarRight']}>
        <QuickActionBtn />
        <CartButton />

        <div className={styles['topbarSeparator']} aria-hidden="true" />

        {/* Currency dropdown */}
        <div ref={currencyRef} className={styles['currencyContainer']}>
          <Button
            variant="ghost"
            className={styles['currencyBtn']}
            onClick={() => {
              setCurrencyOpen((o) => !o);
            }}
            aria-label={t('common.switchCurrency')}
            aria-haspopup="listbox"
            aria-expanded={currencyOpen}
          >
            <span className={styles['currencySymbol']}>{currentCurrency.symbol}</span>
            <span>{currentCurrency.value}</span>
            <ChevronDownIcon className={styles['currencyChevron']} aria-hidden="true" />
          </Button>
          {currencyOpen && (
            <div className={styles['currencyDropdown']} role="listbox">
              {CURRENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === currency}
                  className={
                    opt.value === currency
                      ? `${styles['currencyItem']} ${styles['currencyItemActive']}`
                      : styles['currencyItem']
                  }
                  onClick={() => {
                    setCurrency(opt.value);
                    setCurrencyOpen(false);
                  }}
                >
                  <span className={styles['currencyItemSymbol']}>{opt.symbol}</span>
                  <span className={styles['currencyItemLabel']}>{opt.label}</span>
                  {opt.value === currency && (
                    <CheckIcon className={styles['currencyItemCheck']} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language dropdown */}
        <div ref={langRef} className={styles['langContainer']}>
          <Button
            variant="ghost"
            className={styles['langBtn']}
            onClick={() => {
              setLangOpen((o) => !o);
            }}
            aria-label={t('common.switchLanguage')}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            <img src={currentLang.flag} alt="" aria-hidden="true" className={styles['langFlag']} />
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
                  <img src={lang.flag} alt="" aria-hidden="true" className={styles['langFlag']} />
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className={styles['iconBtn']}
          onClick={toggleTheme}
          aria-label={t('common.toggleTheme')}
        >
          {resolvedTheme === 'dark' ? (
            <SunIcon aria-hidden="true" />
          ) : (
            <MoonIcon aria-hidden="true" />
          )}
        </Button>
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  );
}
