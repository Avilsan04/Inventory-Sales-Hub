import * as React from 'react';
import { Button } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/EmptyState.module.scss';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className={styles['container']}>
      <span className={styles['icon']} aria-hidden="true">
        {icon}
      </span>
      <p className={styles['title']}>{title}</p>
      {description && <p className={styles['description']}>{description}</p>}
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
