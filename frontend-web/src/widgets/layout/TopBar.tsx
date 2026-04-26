import * as React from 'react';
import { BellIcon, LogOutIcon, SearchIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useLogout } from '@features/auth';
import { useNotifications } from '@features/notifications';
import { Input } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

interface PageMeta {
  titleKey: string;
  subtitleKey: string;
}

const PAGE_META: Record<string, PageMeta> = {
  [APP_ROUTES.DASHBOARD]: { titleKey: 'nav.dashboard',  subtitleKey: 'topbar.subtitle.dashboard'  },
  [APP_ROUTES.INVENTORY]: { titleKey: 'nav.inventory',  subtitleKey: 'topbar.subtitle.inventory'  },
  [APP_ROUTES.SALES]:     { titleKey: 'nav.orders',     subtitleKey: 'topbar.subtitle.orders'     },
  [APP_ROUTES.CUSTOMERS]: { titleKey: 'nav.customers',  subtitleKey: 'topbar.subtitle.customers'  },
  [APP_ROUTES.SUPPLIERS]: { titleKey: 'nav.suppliers',  subtitleKey: 'topbar.subtitle.suppliers'  },
  [APP_ROUTES.ANALYTICS]: { titleKey: 'nav.analytics',  subtitleKey: 'topbar.subtitle.analytics'  },
  [APP_ROUTES.SETTINGS]:  { titleKey: 'nav.settings',   subtitleKey: 'topbar.subtitle.settings'   },
};

export function TopBar(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const logout = useLogout();
  const { pathname } = useLocation();

  const meta = PAGE_META[pathname] ?? { titleKey: 'common.appName', subtitleKey: '' };
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <header className={styles['topbar']}>
      <div className={styles['topbarTitle']}>
        <span className={styles['pageTitle']}>{t(meta.titleKey)}</span>
        {meta.subtitleKey && (
          <span className={styles['pageSubtitle']}>{t(meta.subtitleKey)}</span>
        )}
      </div>

      <div className={styles['topbarSearch']}>
        <div className={styles['searchWrapper']}>
          <SearchIcon className={styles['searchIcon']} aria-hidden="true" />
          <Input
            type="search"
            placeholder={t('common.search')}
            className={styles['searchInput']}
            aria-label={t('common.search')}
          />
        </div>
      </div>

      <div className={styles['topbarActions']}>
        <div className={styles['notifWrapper']}>
          <button
            type="button"
            className={styles['iconBtn']}
            aria-label={t('nav.notifications')}
          >
            <BellIcon aria-hidden="true" />
          </button>
          {unreadCount > 0 && (
            <span
              className={styles['notifDot']}
              aria-label={`${String(unreadCount)} unread notifications`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: '#fff' }}
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
