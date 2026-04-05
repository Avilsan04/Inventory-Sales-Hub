import * as React from 'react';
import { cn } from '@shared/lib/cn';
import { Spinner } from '@shared/ui/primitives';
import { useNotifications, useMarkAllAsRead } from '@features/notifications';
import styles from '@shared/styles/themes/pages/Notifications.module.scss';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';

export function NotificationsPage(): React.ReactElement {
  const { data, isLoading, isError } = useNotifications();
  const markAllRead = useMarkAllAsRead();

  if (isLoading) {
    return (
      <div className={baseStyles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return <p role="alert">Failed to load notifications.</p>;
  }

  const unread = data.filter((n) => !n.isRead).length;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Notifications</h1>
          <p>{unread} unread</p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => { markAllRead.mutate(); }}
            disabled={markAllRead.isPending}
          >
            Mark all as read
          </button>
        )}
      </header>
      <ul>
        {data.map((n) => (
          <li key={n.id} className={cn(styles.notification, n.isRead && styles.notificationRead)}>
            <strong>[{n.type}]</strong> {n.title} — {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
