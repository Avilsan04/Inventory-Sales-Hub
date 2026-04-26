import * as React from 'react';
import { Outlet } from 'react-router-dom';

import { useAuthMe } from '@features/auth';
import styles from '@shared/styles/themes/components/Layout.module.scss';
import { Sidebar } from './Sidebar';
import { TestModeBanner } from './TestModeBanner';
import { TopBar } from './TopBar';

export function Layout(): React.ReactElement {
  const { data: user } = useAuthMe();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const closeSidebar = React.useCallback((): void => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className={styles['layout']}>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className={styles['mainArea']}>
        {user?.role === 'test' && <TestModeBanner />}
        <TopBar />

        <main className={styles['main']}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
