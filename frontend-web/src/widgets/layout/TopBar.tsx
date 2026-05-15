import * as React from 'react';
import { MoonIcon, SunIcon, ChevronDownIcon, MenuIcon } from 'lucide-react';
import { useTheme } from '@shared/hooks/useTheme';
import { useLanguageAdapter, type Language } from '@shared/adapters/useLanguageAdapter';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/ui/composed';
import { Button } from '@shared/ui/primitives';
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
  const { translate: t } = useTranslationAdapter();

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={styles['langBtn']}
              aria-label={t('common.switchLanguage')}
            >
              <span>{language.toUpperCase()}</span>
              <ChevronDownIcon className={styles['langChevron']} aria-hidden="true" />
            </Button>
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
