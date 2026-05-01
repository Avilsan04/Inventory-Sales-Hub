import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  WarehouseIcon,
  TagIcon,
  ReceiptIcon,
  UsersIcon,
  BriefcaseIcon,
  FactoryIcon,
  BellIcon,
  Building2Icon,
  SlidersHorizontalIcon,
  LayoutGridIcon,
  ClipboardListIcon,
  UserRoundIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe } from '@features/auth';
import { useEffectiveRole } from '@features/auth/hooks/useEffectiveRole';
import { Avatar, AvatarFallback, BrandMark } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/Sidebar.module.scss';

type NavIconKey =
  | 'dashboard'
  | 'analytics'
  | 'inventory'
  | 'products'
  | 'sales'
  | 'myOrders'
  | 'catalog'
  | 'customers'
  | 'employees'
  | 'shipments'
  | 'notifications'
  | 'tenants'
  | 'settings'
  | 'profile';

interface NavItem {
  to: string;
  labelKey: string;
  iconKey: NavIconKey;
}

interface NavGroup {
  labelKey?: string;
  items: readonly NavItem[];
}

const ADMIN_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.overview',
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.ANALYTICS, labelKey: 'nav.analytics', iconKey: 'analytics' },
    ],
  },
  {
    labelKey: 'nav.section.operations',
    items: [
      { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory', iconKey: 'inventory' },
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers', iconKey: 'customers' },
      { to: APP_ROUTES.EMPLOYEES, labelKey: 'nav.employees', iconKey: 'employees' },
      { to: APP_ROUTES.SUPPLIERS, labelKey: 'nav.shipments', iconKey: 'shipments' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
      { to: APP_ROUTES.ADMIN_TENANTS, labelKey: 'nav.tenants', iconKey: 'tenants' },
    ],
  },
] as const;

const STAFF_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.overview',
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.ANALYTICS, labelKey: 'nav.analytics', iconKey: 'analytics' },
    ],
  },
  {
    labelKey: 'nav.section.operations',
    items: [
      { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory', iconKey: 'inventory' },
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers', iconKey: 'customers' },
      { to: APP_ROUTES.EMPLOYEES, labelKey: 'nav.employees', iconKey: 'employees' },
      { to: APP_ROUTES.SUPPLIERS, labelKey: 'nav.shipments', iconKey: 'shipments' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
] as const;

const COMPANY_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.overview',
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.ANALYTICS, labelKey: 'nav.analytics', iconKey: 'analytics' },
    ],
  },
  {
    labelKey: 'nav.section.operations',
    items: [
      { to: APP_ROUTES.PRODUCTS, labelKey: 'nav.products', iconKey: 'products' },
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers', iconKey: 'customers' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
] as const;

const CUSTOMER_NAV_GROUPS: readonly NavGroup[] = [
  {
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.CATALOG, labelKey: 'nav.catalog', iconKey: 'catalog' },
      { to: APP_ROUTES.MY_ORDERS, labelKey: 'nav.myOrders', iconKey: 'myOrders' },
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
] as const;

const FOOTER_NAV_GROUP: NavGroup = {
  items: [
    { to: APP_ROUTES.PROFILE, labelKey: 'nav.profile', iconKey: 'profile' },
    { to: APP_ROUTES.SETTINGS, labelKey: 'nav.settings', iconKey: 'settings' },
  ],
};

function renderNavIcon(iconKey: NavIconKey): React.ReactElement {
  switch (iconKey) {
    case 'dashboard':
      return <LayoutDashboardIcon aria-hidden="true" />;
    case 'analytics':
      return <TrendingUpIcon aria-hidden="true" />;
    case 'inventory':
      return <WarehouseIcon aria-hidden="true" />;
    case 'products':
      return <TagIcon aria-hidden="true" />;
    case 'sales':
      return <ReceiptIcon aria-hidden="true" />;
    case 'myOrders':
      return <ClipboardListIcon aria-hidden="true" />;
    case 'catalog':
      return <LayoutGridIcon aria-hidden="true" />;
    case 'customers':
      return <UsersIcon aria-hidden="true" />;
    case 'employees':
      return <BriefcaseIcon aria-hidden="true" />;
    case 'shipments':
      return <FactoryIcon aria-hidden="true" />;
    case 'notifications':
      return <BellIcon aria-hidden="true" />;
    case 'tenants':
      return <Building2Icon aria-hidden="true" />;
    case 'settings':
      return <SlidersHorizontalIcon aria-hidden="true" />;
    case 'profile':
      return <UserRoundIcon aria-hidden="true" />;
  }
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  staff: 'Staff',
  company: 'Company',
  customer: 'Customer',
};

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface NavGroupSectionProps {
  group: NavGroup;
  t: (key: string) => string;
  onClose: () => void;
}

function NavGroupSection({ group, t, onClose }: NavGroupSectionProps): React.ReactElement {
  return (
    <div className={styles['navGroup']}>
      {group.labelKey !== undefined && (
        <span className={styles['navSectionLabel']}>{t(group.labelKey)}</span>
      )}
      <ul className={styles['navList']} role="list">
        {group.items.map((item) => (
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
    </div>
  );
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: user } = useAuthMe();
  const effectiveRole = useEffectiveRole();

  const navGroups = React.useMemo((): readonly NavGroup[] => {
    if (effectiveRole === 'customer') return CUSTOMER_NAV_GROUPS;
    if (effectiveRole === 'company') return COMPANY_NAV_GROUPS;
    if (effectiveRole === 'admin') return ADMIN_NAV_GROUPS;
    return STAFF_NAV_GROUPS;
  }, [effectiveRole]);

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
          {navGroups.map((group, idx) => (
            <NavGroupSection key={idx} group={group} t={t} onClose={onClose} />
          ))}
        </nav>

        <div className={styles['footerNav']}>
          <NavGroupSection group={FOOTER_NAV_GROUP} t={t} onClose={onClose} />
        </div>

        <div className={styles['userFooter']}>
          <Avatar>
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className={styles['userInfo']}>
            <div className={styles['userName']}>{user?.username ?? '—'}</div>
            {effectiveRole !== undefined && (
              <span className={styles['roleBadge']}>
                {ROLE_LABELS[effectiveRole] ?? effectiveRole}
              </span>
            )}
            {user?.email !== undefined && <div className={styles['userEmail']}>{user.email}</div>}
          </div>
        </div>
      </aside>
    </>
  );
}
