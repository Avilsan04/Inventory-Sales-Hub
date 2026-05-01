import * as React from 'react';
import { BellIcon, LogOutIcon, SearchIcon } from 'lucide-react';
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

interface PageMeta {
  titleKey: string;
  subtitleKey: string;
}

const PAGE_META: Record<string, PageMeta> = {
  [APP_ROUTES.DASHBOARD]: { titleKey: 'nav.dashboard', subtitleKey: 'topbar.subtitle.dashboard' },
  [APP_ROUTES.INVENTORY]: { titleKey: 'nav.inventory', subtitleKey: 'topbar.subtitle.inventory' },
  [APP_ROUTES.SALES]: { titleKey: 'nav.orders', subtitleKey: 'topbar.subtitle.orders' },
  [APP_ROUTES.CUSTOMERS]: { titleKey: 'nav.customers', subtitleKey: 'topbar.subtitle.customers' },
  [APP_ROUTES.SUPPLIERS]: { titleKey: 'nav.suppliers', subtitleKey: 'topbar.subtitle.suppliers' },
  [APP_ROUTES.ANALYTICS]: { titleKey: 'nav.analytics', subtitleKey: 'topbar.subtitle.analytics' },
  [APP_ROUTES.SETTINGS]: { titleKey: 'nav.settings', subtitleKey: 'topbar.subtitle.settings' },
};

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

  const meta = PAGE_META[pathname] ?? { titleKey: 'common.appName', subtitleKey: '' };
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
      <div className={styles['topbarTitle']}>
        <span className={styles['pageTitle']}>{t(meta.titleKey)}</span>
        {meta.subtitleKey && <span className={styles['pageSubtitle']}>{t(meta.subtitleKey)}</span>}
      </div>

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

        <div className={styles['notifWrapper']}>
          <button type="button" className={styles['iconBtn']} aria-label={t('nav.notifications')}>
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
