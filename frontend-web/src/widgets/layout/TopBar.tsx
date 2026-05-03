import * as React from 'react';
import { BellIcon, HelpCircleIcon, LayoutGridIcon, LogOutIcon, SearchIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe, useLogout } from '@features/auth';
import { useViewMode } from '@features/auth/context/ViewModeContext';
import type { ViewRole } from '@features/auth/context/ViewModeContext';
import { useNotifications } from '@features/notifications';
import { Input } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

interface RoleConfig {
  readonly role: ViewRole;
  readonly label: string;
  readonly icon: string;
  readonly allowedRoutes?: Set<string>;
}

const ROLE_CONFIGS: ReadonlyArray<RoleConfig> = [
  { role: 'admin', label: 'Admin', icon: '🛡️' },
  {
    role: 'customer',
    label: 'Cliente',
    icon: '🛍️',
    allowedRoutes: new Set([
      APP_ROUTES.DASHBOARD,
      APP_ROUTES.SALES,
      APP_ROUTES.PROFILE,
      APP_ROUTES.SETTINGS,
    ]),
  },
  {
    role: 'company',
    label: 'Empresa',
    icon: '🏢',
    allowedRoutes: new Set([
      APP_ROUTES.DASHBOARD,
      APP_ROUTES.PRODUCTS,
      APP_ROUTES.SALES,
      APP_ROUTES.PROFILE,
      APP_ROUTES.SETTINGS,
    ]),
  },
];

export function TopBar(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const logout = useLogout();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: user } = useAuthMe();
  const { viewAs, setViewAs } = useViewMode();

  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const isTest = user?.role === 'test';

  const handleSwitch = React.useCallback(
    (role: ViewRole): void => {
      const config = ROLE_CONFIGS.find((c) => c.role === role);
      setViewAs(role);
      if (config?.allowedRoutes !== undefined && !config.allowedRoutes.has(pathname)) {
        void navigate(APP_ROUTES.DASHBOARD, { replace: true });
      }
    },
    [setViewAs, navigate, pathname]
  );

  return (
    <header className={styles['topbar']}>
      <div className={styles['topbarSearch']}>
        {isTest && <span className={styles['testBanner']}>⚡ Test Mode · Viendo como:</span>}
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
        {isTest && (
          <div className={styles['rolePills']}>
            {ROLE_CONFIGS.map(({ role, label, icon }) => (
              <button
                key={role}
                type="button"
                className={cn(styles['rolePill'], viewAs === role && styles['rolePillActive'])}
                onClick={() => {
                  handleSwitch(role);
                }}
                disabled={viewAs === role}
                aria-pressed={viewAs === role}
              >
                {icon} {label}
              </button>
            ))}
          </div>
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
