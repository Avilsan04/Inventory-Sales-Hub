import * as React from 'react';
import { BellIcon, HelpCircleIcon, LayoutGridIcon, LogOutIcon, SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useLogout } from '@features/auth';
import { useNotifications } from '@features/notifications';
import { Input } from '@shared/ui/primitives';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/composed';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

const DEV_ROLES = ['company', 'admin', 'manager', 'staff', 'customer'] as const;

export function TopBar(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const logout = useLogout();
  const navigate = useNavigate();

  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <header className={styles['topbar']}>
      <div className={styles['topbarSearch']}>
        <div className={styles['searchWrapper']}>
          <SearchIcon className={styles['searchIcon']} aria-hidden="true" />
          <Input
            type="search"
            placeholder={t('common.search')}
            className={cn(styles['searchInput'], styles['searchInputGlow'])}
            aria-label={t('common.search')}
          />
        </div>
      </div>

      <div className={styles['topbarActions']}>
        {import.meta.env.DEV && (
          <Select
            value={localStorage.getItem('TEST_MODE_ROLE') ?? 'company'}
            onValueChange={(v: string) => {
              localStorage.setItem('TEST_MODE_ROLE', v);
              window.location.reload();
            }}
          >
            <SelectTrigger size="sm" aria-label="Dev role switcher">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEV_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <button type="button" className={styles['iconBtn']} aria-label="Ayuda">
          <HelpCircleIcon aria-hidden="true" />
        </button>

        <button type="button" className={styles['iconBtn']} aria-label="Apps">
          <LayoutGridIcon aria-hidden="true" />
        </button>

        <div className={styles['notifWrapper']}>
          <button
            type="button"
            className={styles['iconBtn']}
            aria-label={t('nav.notifications')}
            onClick={() => {
              void navigate(APP_ROUTES.NOTIFICATIONS);
            }}
          >
            <BellIcon aria-hidden="true" />
          </button>
          {unreadCount > 0 && (
            <span
              className={styles['notifDot']}
              aria-label={`${String(unreadCount)} unread notifications`}
            >
              {unreadCount > 9 ? '9+' : String(unreadCount)}
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles['iconBtn']}
          onClick={logout}
          aria-label={t('auth.logout')}
          title={t('auth.logout')}
        >
          <LogOutIcon aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
