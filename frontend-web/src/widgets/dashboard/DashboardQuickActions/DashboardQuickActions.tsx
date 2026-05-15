import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/ui/primitives';
import styles from './DashboardQuickActions.module.scss';

export interface QuickAction {
  icon: React.ReactNode;
  labelKey: string;
  descKey: string;
  onClick: () => void;
  badge?: React.ReactNode;
}

interface DashboardQuickActionsProps {
  titleKey?: string;
  actions: QuickAction[];
}

export function DashboardQuickActions({
  titleKey = 'dashboard.quickActions.title',
  actions,
}: DashboardQuickActionsProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <h2 className={styles['title']}>{t(titleKey)}</h2>
      </div>
      <div className={styles['grid']}>
        {actions.map((action, i) => (
          <Button key={i} variant="ghost" className={styles['card']} onClick={action.onClick}>
            <div className={styles['icon']}>{action.icon}</div>
            <p className={styles['label']}>
              {t(action.labelKey)}
              {action.badge}
            </p>
            <p className={styles['desc']}>{t(action.descKey)}</p>
          </Button>
        ))}
      </div>
    </div>
  );
}
