import * as React from 'react';
import { Outlet } from 'react-router-dom';

import styles from '@shared/styles/themes/components/Layout.module.scss';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout(): React.ReactElement {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const closeSidebar = React.useCallback((): void => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className={styles['layout']}>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className={styles['mainArea']}>
        <TopBar />

        <main className={styles['main']}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
