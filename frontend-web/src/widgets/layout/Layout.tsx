import * as React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PackageIcon, SunIcon, MoonIcon, LayoutDashboardIcon } from 'lucide-react';

// Strict FSD: Importing downwards to 'shared'
import { useTheme } from '@shared/hooks/useTheme';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Layout.module.scss';

// Temporary constant until routes are formally migrated to @shared/config/routes.ts
const ROUTES = {
  HOME: '/',
} as const;

export function Layout(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className={styles['layout']}>
      <header className={styles['header']}>
        <div className={styles['headerLeft']}>
          <NavLink to={ROUTES.HOME} className={styles['logo']}>
            <PackageIcon className={styles['logoIcon']} aria-hidden="true" />
            <span>{t('common.appName')}</span>
          </NavLink>

          <nav className={styles['nav']} aria-label="Main Navigation">
            <NavLink
              to={ROUTES.HOME}
              end
              className={({ isActive }): string =>
                cn(styles['navLink'], isActive && styles['navLinkActive'])
              }
            >
              <LayoutDashboardIcon aria-hidden="true" />
              {t('nav.home')}
            </NavLink>
          </nav>
        </div>

        <div className={styles['headerRight']}>
          <button
            type="button"
            className={styles['themeToggle']}
            onClick={toggleTheme}
            aria-label={t('common.toggleTheme')}
            title={t('common.toggleTheme')}
          >
            {theme === 'dark' ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main className={styles['main']}>
        <Outlet />
      </main>
    </div>
  );
}