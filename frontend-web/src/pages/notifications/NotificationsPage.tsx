import * as React from 'react';
import { InfoIcon, AlertTriangleIcon, XCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useNotifications, useMarkAllAsRead } from '@features/notifications';
import { Spinner, Badge, Button } from '@shared/ui/primitives';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { Notification } from '@entities/notification';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Notifications.module.scss';

type NotifType = 'info' | 'warning' | 'error' | 'success';

type GroupKey = 'today' | 'yesterday' | 'thisWeek' | 'older';

function getGroupKey(iso: string): GroupKey {
  const now = new Date();
  const d = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
  const startOfWeek = new Date(startOfToday.getTime() - (now.getDay() || 7) * 86_400_000);

  if (d >= startOfToday) return 'today';
  if (d >= startOfYesterday) return 'yesterday';
  if (d >= startOfWeek) return 'thisWeek';
  return 'older';
}

const GROUP_ORDER: GroupKey[] = ['today', 'yesterday', 'thisWeek', 'older'];

function groupNotifications(items: Notification[]): Map<GroupKey, Notification[]> {
  const map = new Map<GroupKey, Notification[]>(GROUP_ORDER.map((k) => [k, []]));
  for (const n of items) {
    map.get(getGroupKey(n.createdAt))?.push(n);
  }
  return map;
}

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
    case 'info':
      return <InfoIcon {...props} />;
    case 'warning':
      return <AlertTriangleIcon {...props} />;
    case 'error':
      return <XCircleIcon {...props} />;
    case 'success':
      return <CheckCircle2Icon {...props} />;
  }
}

function typeIconClass(type: NotifType, s: typeof styles): string {
  const map: Record<NotifType, string> = {
    info: s['notifInfo'] ?? '',
    warning: s['notifWarning'] ?? '',
    error: s['notifError'] ?? '',
    success: s['notifSuccess'] ?? '',
  };
  return cn(s['notifIcon'], map[type]);
}

export function NotificationsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useNotifications();
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
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
            void refetch();
          }}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const unreadCount = data.filter((n) => !n.isRead).length;
  const grouped = groupNotifications(data);

  const groupLabels: Record<GroupKey, string> = {
    today: t('notifications.groupToday'),
    yesterday: t('notifications.groupYesterday'),
    thisWeek: t('notifications.groupThisWeek'),
    older: t('notifications.groupOlder'),
  };

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
            onClick={() => {
              markAllRead.mutate();
            }}
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
        <div className={styles['notifList']} aria-label={t('notifications.title')}>
          {GROUP_ORDER.map((groupKey) => {
            const items = grouped.get(groupKey) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={groupKey}>
                <p className={styles['groupLabel']}>{groupLabels[groupKey]}</p>
                <ul>
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className={cn(styles['notifItem'], !n.isRead && styles['notifItemUnread'])}
                    >
                      {renderTypeIcon(n.type, typeIconClass(n.type, styles))}
                      <div className={styles['notifBody']}>
                        <p className={styles['notifTitle']}>
                          {t(`notifications.messages.${n.messageKey}.title`)}
                        </p>
                        <p className={styles['notifMessage']}>
                          {t(`notifications.messages.${n.messageKey}.body`, n.messageParams)}
                        </p>
                        <div className={styles['notifMeta']}>
                          <Badge variant={typeBadgeVariant(n.type)}>
                            {t(`notifications.types.${n.type}`)}
                          </Badge>
                          <span className={styles['notifTime']}>
                            {new Intl.DateTimeFormat(i18n.language, {
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(n.createdAt))}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
