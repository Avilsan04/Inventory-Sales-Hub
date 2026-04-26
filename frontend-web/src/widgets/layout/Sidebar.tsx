import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  TruckIcon,
  SettingsIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe } from '@features/auth';
import { useEffectiveRole } from '@features/auth/hooks/useEffectiveRole';
import { Avatar, AvatarFallback, BrandMark } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/Sidebar.module.scss';

type NavIconKey = 'dashboard' | 'inventory' | 'orders' | 'customers' | 'shipments' | 'settings';

interface NavItem {
  to: string;
  labelKey: string;
  iconKey: NavIconKey;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard',  iconKey: 'dashboard'  },
  { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory',  iconKey: 'inventory'  },
  { to: APP_ROUTES.SALES,     labelKey: 'nav.orders',     iconKey: 'orders'     },
  { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers',  iconKey: 'customers'  },
  { to: APP_ROUTES.SUPPLIERS, labelKey: 'nav.shipments',  iconKey: 'shipments'  },
] as const;

const CUSTOMER_NAV_ITEMS: readonly NavItem[] = [
  { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
  { to: APP_ROUTES.SALES,     labelKey: 'nav.orders',    iconKey: 'orders'    },
] as const;

const FOOTER_NAV: readonly NavItem[] = [
  { to: APP_ROUTES.SETTINGS, labelKey: 'nav.settings', iconKey: 'settings' },
] as const;

function renderNavIcon(iconKey: NavIconKey): React.ReactElement {
  switch (iconKey) {
    case 'dashboard':  return <LayoutDashboardIcon aria-hidden="true" />;
    case 'inventory':  return <PackageIcon         aria-hidden="true" />;
    case 'orders':     return <ShoppingCartIcon    aria-hidden="true" />;
    case 'customers':  return <UsersIcon           aria-hidden="true" />;
    case 'shipments':  return <TruckIcon           aria-hidden="true" />;
    case 'settings':   return <SettingsIcon        aria-hidden="true" />;
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: user } = useAuthMe();
  const effectiveRole = useEffectiveRole();

  const navItems = React.useMemo(
    () => (effectiveRole === 'customer' ? CUSTOMER_NAV_ITEMS : NAV_ITEMS),
    [effectiveRole],
  );

  const userInitials = user ? initials(user.username) : '..';

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
          <BrandMark size={32} />
          <span className={styles['brandName']}>{t('common.appName')}</span>
        </div>

        <nav className={styles['nav']}>
          <ul className={styles['navList']} role="list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === APP_ROUTES.DASHBOARD}
                  className={({ isActive }): string =>
                    cn(styles['navItem'], isActive && styles['navItemActive'])
                  }
                  onClick={onClose}
                >
                  <span className={styles['navIcon']}>{renderNavIcon(item.iconKey)}</span>
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles['footerNav']}>
          <ul className={styles['navList']} role="list">
            {FOOTER_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }): string =>
                    cn(styles['navItem'], isActive && styles['navItemActive'])
                  }
                  onClick={onClose}
                >
                  <span className={styles['navIcon']}>{renderNavIcon(item.iconKey)}</span>
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles['userFooter']}>
          <Avatar>
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className={styles['userInfo']}>
            <div className={styles['userName']}>{user?.username ?? '—'}</div>
            {user?.email !== undefined && (
              <div className={styles['userEmail']}>{user.email}</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
