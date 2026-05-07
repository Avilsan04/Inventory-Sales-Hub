import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTE_META } from './routeMeta';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

export function PageTitle(): React.ReactElement | null {
  const { pathname } = useLocation();
  const meta = ROUTE_META[pathname];

  if (!meta) return null;

  const { title, Icon } = meta;

  return (
    <div className={styles['pageTitle']}>
      <Icon className={styles['pageTitleIcon']} aria-hidden="true" />
      <span className={styles['pageTitleText']}>{title}</span>
    </div>
  );
}
