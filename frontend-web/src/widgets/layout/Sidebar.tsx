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
  PlusIcon,
  StoreIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useEffectiveRole } from '@features/auth/hooks/useEffectiveRole';
import { BrandMark } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/Sidebar.module.scss';

type NavIconKey =
  | 'dashboard'
  | 'analytics'
  | 'inventory'
  | 'products'
  | 'sales'
  | 'pos'
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

const CUSTOMER_NAV_GROUPS: readonly NavGroup[] = [
  {
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.CATALOG, labelKey: 'nav.catalog', iconKey: 'catalog' },
      { to: APP_ROUTES.POS, labelKey: 'nav.pos', iconKey: 'pos' },
      { to: APP_ROUTES.MY_ORDERS, labelKey: 'nav.myOrders', iconKey: 'myOrders' },
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
] as const;

// New canonical role nav groups

const COMPANY_ROLE_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.overview',
    items: [
      { to: APP_ROUTES.DASHBOARD, labelKey: 'nav.dashboard', iconKey: 'dashboard' },
      { to: APP_ROUTES.ANALYTICS, labelKey: 'nav.analytics', iconKey: 'analytics' },
    ],
  },
  {
    labelKey: 'nav.section.operations',
    items: [{ to: APP_ROUTES.EMPLOYEES, labelKey: 'nav.employees', iconKey: 'employees' }],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.ADMIN_TENANTS, labelKey: 'nav.tenants', iconKey: 'tenants' },
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
] as const;

const ADMIN_ROLE_NAV_GROUPS: readonly NavGroup[] = [
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
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory', iconKey: 'inventory' },
      { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers', iconKey: 'customers' },
      { to: APP_ROUTES.EMPLOYEES, labelKey: 'nav.employees', iconKey: 'employees' },
      { to: APP_ROUTES.SUPPLIERS, labelKey: 'nav.shipments', iconKey: 'shipments' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.ADMIN_TENANTS, labelKey: 'nav.tenants', iconKey: 'tenants' },
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
] as const;

const MANAGER_ROLE_NAV_GROUPS: readonly NavGroup[] = [
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
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory', iconKey: 'inventory' },
      { to: APP_ROUTES.CUSTOMERS, labelKey: 'nav.customers', iconKey: 'customers' },
      { to: APP_ROUTES.EMPLOYEES, labelKey: 'nav.employees', iconKey: 'employees' },
    ],
  },
  {
    labelKey: 'nav.section.system',
    items: [
      { to: APP_ROUTES.NOTIFICATIONS, labelKey: 'nav.notifications', iconKey: 'notifications' },
    ],
  },
] as const;

const STAFF_ROLE_NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: 'nav.section.operations',
    items: [
      { to: APP_ROUTES.POS, labelKey: 'nav.pos', iconKey: 'pos' },
      { to: APP_ROUTES.SALES, labelKey: 'nav.sales', iconKey: 'sales' },
      { to: APP_ROUTES.INVENTORY, labelKey: 'nav.inventory', iconKey: 'inventory' },
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
    case 'pos':
      return <StoreIcon aria-hidden="true" />;
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
  const effectiveRole = useEffectiveRole();

  const navGroups = React.useMemo((): readonly NavGroup[] => {
    if (effectiveRole === 'company') return COMPANY_ROLE_NAV_GROUPS;
    if (effectiveRole === 'admin') return ADMIN_ROLE_NAV_GROUPS;
    if (effectiveRole === 'manager') return MANAGER_ROLE_NAV_GROUPS;
    if (effectiveRole === 'staff') return STAFF_ROLE_NAV_GROUPS;
    if (effectiveRole === 'customer') return CUSTOMER_NAV_GROUPS;
    return STAFF_ROLE_NAV_GROUPS;
  }, [effectiveRole]);

  const showAddProduct = effectiveRole === 'admin' || effectiveRole === 'manager';

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
          <div className={styles['brandText']}>
            <span className={styles['brandName']}>{t('common.appName')}</span>
            <span className={styles['brandSub']}>Enterprise Suite</span>
          </div>
        </div>

        {showAddProduct && (
          <div className={styles['ctaWrapper']}>
            <NavLink to={APP_ROUTES.INVENTORY} className={styles['cta']} onClick={onClose}>
              <PlusIcon className={styles['ctaIcon']} aria-hidden="true" />
              Add Product
            </NavLink>
          </div>
        )}

        <nav className={styles['nav']}>
          {navGroups.map((group, idx) => (
            <NavGroupSection key={idx} group={group} t={t} onClose={onClose} />
          ))}
        </nav>

        <div className={styles['footerNav']}>
          <NavGroupSection group={FOOTER_NAV_GROUP} t={t} onClose={onClose} />
        </div>
      </aside>
    </>
  );
}
