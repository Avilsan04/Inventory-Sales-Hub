import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthMe } from '@features/auth';
import styles from './DashboardHeader.module.scss';

interface DashboardHeaderProps {
  greetingKey: string;
  children?: React.ReactNode;
}

function todayLabel(locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export function DashboardHeader({
  greetingKey,
  children,
}: DashboardHeaderProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { data: me } = useAuthMe();
  const firstName = me?.username.split(' ')[0] ?? '';

  return (
    <header className={styles['header']}>
      <div className={styles['meta']}>
        <h1 className={styles['greeting']}>
          {t(greetingKey)}, {firstName}
        </h1>
        <p className={styles['date']}>{todayLabel(i18n.language)}</p>
      </div>
      {children != null && <div className={styles['actions']}>{children}</div>}
    </header>
  );
}
