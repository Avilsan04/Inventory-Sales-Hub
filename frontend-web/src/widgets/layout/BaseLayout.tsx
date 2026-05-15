import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import styles from '@shared/styles/themes/components/Layout.module.scss';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface BaseLayoutProps {
  /** Optional content rendered above TopBar (e.g. ImpersonationBanner). */
  readonly header?: React.ReactNode;
}

export function BaseLayout({ header }: BaseLayoutProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const closeSidebar = React.useCallback((): void => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className={styles['layout']}>
      <a href="#main-content" className={styles['skipLink']}>
        {t('common.skipToContent')}
      </a>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className={styles['mainArea']}>
        {header}
        <TopBar
          onToggleSidebar={() => {
            setIsSidebarOpen((prev) => !prev);
          }}
        />

        <main id="main-content" className={styles['main']}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
