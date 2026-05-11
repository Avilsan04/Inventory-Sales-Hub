import * as React from 'react';
import { Skeleton } from '../Skeleton';
import styles from './KpiCard.module.scss';

export type KpiCardAccent =
  | 'primary'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'purple'
  | 'spent'
  | 'error';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent?: KpiCardAccent;
  subtext?: React.ReactNode;
  isLoading?: boolean;
}

export function KpiCard({
  label,
  value,
  icon,
  accent = 'primary',
  subtext,
  isLoading = false,
}: KpiCardProps): React.ReactElement {
  return (
    <div className={[styles['card'], styles[`cardAccent-${accent}`]].join(' ')}>
      <div className={styles['topRow']}>
        <div className={[styles['iconContainer'], styles[`icon-${accent}`]].join(' ')}>{icon}</div>
      </div>
      <div>
        <p className={styles['label']}>{label}</p>
        <div className={styles['value']}>
          {isLoading ? <Skeleton className={styles['skeleton']} /> : value}
        </div>
        {!isLoading && subtext != null && <p className={styles['subtext']}>{subtext}</p>}
      </div>
    </div>
  );
}
