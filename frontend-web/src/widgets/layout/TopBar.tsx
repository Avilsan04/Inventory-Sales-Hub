import * as React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@shared/hooks/useTheme';
import styles from '@shared/styles/themes/components/TopBar.module.scss';
import { PageTitle } from './topbar/PageTitle';
import { CommandPalette } from './topbar/CommandPalette';
import { QuickActionBtn } from './topbar/QuickActionBtn';
import { CartButton } from './topbar/CartButton';
import { NotificationPanel } from './topbar/NotificationPanel';
import { UserMenu } from './topbar/UserMenu';

export function TopBar(): React.ReactElement {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className={styles['topbar']}>
      <div className={styles['topbarLeft']}>
        <PageTitle />
      </div>

      <div className={styles['topbarCenter']}>
        <CommandPalette />
      </div>

      <div className={styles['topbarRight']}>
        <QuickActionBtn />
        <CartButton />
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
