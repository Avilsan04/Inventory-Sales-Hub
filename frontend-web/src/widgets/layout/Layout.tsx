import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';

import styles from '@shared/styles/themes/components/Layout.module.scss';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout(): React.ReactElement {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { translate: t } = useTranslationAdapter();

  const closeSidebar = React.useCallback((): void => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebar = React.useCallback((): void => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className={styles['layout']}>
      <a href="#main-content" className={styles['skipLink']}>
        {t('common.skipToContent')}
      </a>

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className={styles['mainArea']}>
        <TopBar onToggleSidebar={toggleSidebar} />

        <main id="main-content" className={styles['main']}>
          <div key={location.pathname} className={styles['pageTransition']}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
