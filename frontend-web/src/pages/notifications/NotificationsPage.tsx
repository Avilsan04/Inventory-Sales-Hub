import * as React from 'react';
import { InfoIcon, AlertTriangleIcon, XCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useNotifications, useMarkAllAsRead } from '@features/notifications';
import { Spinner, Badge, Button } from '@shared/ui/primitives';
import type { BadgeVariant } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Notifications.module.scss';

type NotifType = 'info' | 'warning' | 'error' | 'success';

function typeBadgeVariant(type: NotifType): BadgeVariant {
  const map: Record<NotifType, BadgeVariant> = {
    info: 'outline',
    warning: 'secondary',
    error: 'destructive',
    success: 'success',
  };
  return map[type];
}

function renderTypeIcon(type: NotifType, iconClass: string): React.ReactElement {
  const props = { 'aria-hidden': true as const, className: iconClass };
  switch (type) {
    case 'info':    return <InfoIcon {...props} />;
    case 'warning': return <AlertTriangleIcon {...props} />;
    case 'error':   return <XCircleIcon {...props} />;
    case 'success': return <CheckCircle2Icon {...props} />;
  }
}

function typeIconClass(type: NotifType, s: typeof styles): string {
  const map: Record<NotifType, string> = {
    info:    s['notifInfo'] ?? '',
    warning: s['notifWarning'] ?? '',
    error:   s['notifError'] ?? '',
    success: s['notifSuccess'] ?? '',
  };
  return cn(s['notifIcon'], map[type]);
}

export function NotificationsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isLoading, isError } = useNotifications();
  const markAllRead = useMarkAllAsRead();

  if (isLoading) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  const unreadCount = data.filter((n) => !n.isRead).length;

  return (
    <div className={styles['page']}>
      <div className={styles['pageHeader']}>
        <div className={styles['headerText']}>
          <h1 className={styles['title']}>{t('notifications.title')}</h1>
          <p className={styles['subtitle']}>
            {t('notifications.unread', { count: String(unreadCount) })}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { markAllRead.mutate(); }}
            disabled={markAllRead.isPending}
          >
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {data.length === 0 ? (
        <div className={styles['placeholderContainer']}>
          <p className={styles['placeholder']}>{t('notifications.noNotifications')}</p>
        </div>
      ) : (
        <ul className={styles['notifList']} aria-label={t('notifications.title')}>
          {data.map((n) => (
            <li
              key={n.id}
              className={cn(styles['notifItem'], !n.isRead && styles['notifItemUnread'])}
            >
              {renderTypeIcon(n.type as NotifType, typeIconClass(n.type as NotifType, styles))}
              <div className={styles['notifBody']}>
                <p className={styles['notifTitle']}>{n.title}</p>
                <p className={styles['notifMessage']}>{n.message}</p>
                <div className={styles['notifMeta']}>
                  <Badge variant={typeBadgeVariant(n.type as NotifType)}>
                    {t(`notifications.types.${n.type}`)}
                  </Badge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
