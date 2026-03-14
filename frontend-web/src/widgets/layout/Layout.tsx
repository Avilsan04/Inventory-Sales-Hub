import * as React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PackageIcon, SunIcon, MoonIcon, LayoutDashboardIcon } from 'lucide-react';

// Strict FSD: Importing downwards to 'shared'
import { useTheme } from '@shared/hooks/useTheme';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/Layout.module.scss';

export function Layout(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className={styles['layout']}>
      <header className={styles['header']}>
        <div className={styles['headerLeft']}>
          <NavLink to={APP_ROUTES.ROOT} className={styles['logo']}>
            <PackageIcon className={styles['logoIcon']} aria-hidden="true" />
            <span>{t('common.appName')}</span>
          </NavLink>

          <nav className={styles['nav']} aria-label="Main Navigation">
            <NavLink
              to={APP_ROUTES.DASHBOARD}
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