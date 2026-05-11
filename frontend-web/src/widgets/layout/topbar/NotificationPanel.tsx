import * as React from 'react';
import {
  BellIcon,
  InfoIcon,
  AlertTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverTrigger, PopoverContent } from '@shared/ui/composed';
import { APP_ROUTES } from '@shared/config/routes';
import { useNotifications, useMarkAllAsRead } from '@features/notifications';
import type { NotificationType } from '@entities/notification';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  info: InfoIcon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
};

const TYPE_CLASS: Record<NotificationType, string> = {
  info: styles['notifTypeInfo'] ?? '',
  warning: styles['notifTypeWarning'] ?? '',
  error: styles['notifTypeError'] ?? '',
  success: styles['notifTypeSuccess'] ?? '',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${String(mins)}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${String(hrs)}h`;
  return `${String(Math.floor(hrs / 24))}d`;
}

export function NotificationPanel(): React.ReactElement {
  const { data: notifications } = useNotifications();
  const { mutate: markAll } = useMarkAllAsRead();
  const navigate = useNavigate();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const recent = notifications?.slice(0, 10) ?? [];

  return (
    <div className={styles['notifWrapper']}>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={styles['iconBtn']} aria-label="Notificaciones">
            <BellIcon aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className={styles['notifPanel']}>
          <div className={styles['notifPanelHeader']}>
            <span className={styles['notifPanelTitle']}>Notificaciones</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles['markAllBtn']}
                onClick={() => {
                  markAll();
                }}
              >
                Marcar leídas
              </button>
            )}
          </div>
          <div className={styles['notifList']}>
            {recent.length === 0 ? (
              <p className={styles['notifEmpty']}>Sin notificaciones</p>
            ) : (
              recent.map((n) => {
                const Icon = TYPE_ICON[n.type];
                return (
                  <div
                    key={n.id}
                    className={`${styles['notifItem'] ?? ''} ${!n.isRead ? (styles['notifUnread'] ?? '') : ''}`}
                  >
                    <Icon
                      className={`${styles['notifTypeIcon'] ?? ''} ${TYPE_CLASS[n.type]}`}
                      aria-hidden="true"
                    />
                    <div className={styles['notifContent']}>
                      <span className={styles['notifTitle']}>{n.title}</span>
                      {n.message && <span className={styles['notifMessage']}>{n.message}</span>}
                    </div>
                    <span className={styles['notifTime']}>{timeAgo(n.createdAt)}</span>
                  </div>
                );
              })
            )}
          </div>
          <div className={styles['notifPanelFooter']}>
            <button
              type="button"
              className={styles['viewAllBtn']}
              onClick={() => {
                void navigate(APP_ROUTES.NOTIFICATIONS);
              }}
            >
              Ver todas →
            </button>
          </div>
        </PopoverContent>
      </Popover>
      {unreadCount > 0 && (
        <span
          className={styles['notifDot']}
          aria-label={`${String(unreadCount)} sin leer`}
          aria-hidden="true"
        >
          {unreadCount > 9 ? '9+' : String(unreadCount)}
        </span>
      )}
    </div>
  );
}
