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

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps): React.ReactElement {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguageAdapter();

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

        <div className={styles['topbarSeparator']} aria-hidden="true" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={styles['langBtn']} aria-label="Select language">
              <span>{language.toUpperCase()}</span>
              <ChevronDownIcon className={styles['langChevron']} aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={styles['langMenu']}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <DropdownMenuItem
                key={lang.value}
                onClick={() => {
                  if (lang.value !== language) toggleLanguage();
                }}
                className={lang.value === language ? styles['langItemActive'] : undefined}
              >
                <span>{lang.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          className={styles['iconBtn']}
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
