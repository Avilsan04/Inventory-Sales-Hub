import * as React from 'react';
import { MoonIcon, SunIcon, ChevronDownIcon, MenuIcon } from 'lucide-react';
import { useTheme } from '@shared/hooks/useTheme';
import { useLanguageAdapter, type Language } from '@shared/adapters/useLanguageAdapter';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/ui/composed';
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

  const current = LANGUAGE_MAP[language];

  return (
    <header className={styles['topbar']}>
      <div className={styles['topbarLeft']}>
        {onToggleSidebar !== undefined && (
          <button
            type="button"
            className={styles['menuBtn']}
            onClick={onToggleSidebar}
            aria-label="Open menu"
          >
            <MenuIcon aria-hidden="true" />
          </button>
        )}
        <PageTitle />
      </div>

      <div className={styles['topbarCenter']}>
        <CommandPalette />
      </div>

      <div className={styles['topbarRight']}>
        <QuickActionBtn />
        <CartButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={styles['langBtn']} aria-label="Select language">
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

        <button
          type="button"
          className={styles['iconBtn']}
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {resolvedTheme === 'dark' ? (
            <SunIcon aria-hidden="true" />
          ) : (
            <MoonIcon aria-hidden="true" />
          )}
        </button>
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  );
}
