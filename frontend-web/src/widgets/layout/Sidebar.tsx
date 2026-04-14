import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  PackageIcon,
  LayoutDashboardIcon,
  BoxesIcon,
  ShoppingCartIcon,
  UsersIcon,
  UserCogIcon,
  TruckIcon,
  BarChart3Icon,
  BellIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Progress } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/Sidebar.module.scss';

type NavIconKey =
  | 'dashboard'
  | 'inventory'
  | 'products'
  | 'sales'
  | 'customers'
  | 'employees'
  | 'suppliers'
  | 'analytics'
  | 'notifications';

interface NavItem {
  to: string;
  labelKey: string;
  iconKey: NavIconKey;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: APP_ROUTES.DASHBOARD,     labelKey: 'nav.dashboard',     iconKey: 'dashboard'     },
  { to: APP_ROUTES.INVENTORY,     labelKey: 'nav.inventory',     iconKey: 'inventory'     },
  { to: APP_ROUTES.PRODUCTS,      labelKey: 'nav.products',      iconKey: 'products'      },
  { to: APP_ROUTES.SALES,         labelKey: 'nav.sales',         iconKey: 'sales'         },
  { to: APP_ROUTES.CUSTOMERS,     labelKey: 'nav.customers',     iconKey: 'customers'     },
  { to: APP_ROUTES.EMPLOYEES,     labelKey: 'nav.employees',     iconKey: 'employees'     },
  { to: APP_ROUTES.SUPPLIERS,     labelKey: 'nav.suppliers',     iconKey: 'suppliers'     },
  { to: APP_ROUTES.ANALYTICS,     labelKey: 'nav.analytics',     iconKey: 'analytics'     },
  { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
] as const;

const STORAGE_USED = 68;

function renderNavIcon(iconKey: NavIconKey): React.ReactElement {
  switch (iconKey) {
    case 'dashboard':     return <LayoutDashboardIcon aria-hidden="true" />;
    case 'inventory':     return <BoxesIcon           aria-hidden="true" />;
    case 'products':      return <PackageIcon         aria-hidden="true" />;
    case 'sales':         return <ShoppingCartIcon    aria-hidden="true" />;
    case 'customers':     return <UsersIcon           aria-hidden="true" />;
    case 'employees':     return <UserCogIcon         aria-hidden="true" />;
    case 'suppliers':     return <TruckIcon           aria-hidden="true" />;
    case 'analytics':     return <BarChart3Icon       aria-hidden="true" />;
    case 'notifications': return <BellIcon            aria-hidden="true" />;
  }
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();

  return (
    <>
      <div
        className={cn(styles['overlay'], isOpen && styles['overlayVisible'])}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(styles['sidebar'], isOpen && styles['sidebarOpen'])}
        aria-label="Main Navigation"
      >
        <div className={styles['brand']}>
          <PackageIcon className={styles['brandIcon']} aria-hidden="true" />
          <span className={styles['brandName']}>{t('common.appName')}</span>
        </div>

        <nav className={styles['nav']}>
          <ul className={styles['navList']} role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === APP_ROUTES.DASHBOARD}
                  className={({ isActive }): string =>
                    cn(styles['navItem'], isActive && styles['navItemActive'])
                  }
                  onClick={onClose}
                >
                  <span className={styles['navIcon']}>
                    {renderNavIcon(item.iconKey)}
                  </span>
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles['storageFooter']}>
          <div className={styles['storageHeader']}>
            <span className={styles['storageLabel']}>{t('sidebar.storage')}</span>
            <span className={styles['storagePercent']}>{STORAGE_USED}%</span>
          </div>
          <Progress value={STORAGE_USED} aria-label={t('sidebar.storage')} />
          <p className={styles['storageSubtext']}>{t('sidebar.storageDetail')}</p>
        </div>
      </aside>
    </>
  );
}
