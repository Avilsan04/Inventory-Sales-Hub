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
  ScrollTextIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useEffectiveRole } from '@features/auth/hooks/useEffectiveRole';
import { BrandMark } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import {
  type NavIconKey,
  type NavGroup,
  NAV_GROUPS_BY_ROLE,
  FOOTER_NAV_GROUP,
} from '@shared/config/navigation';
import styles from '@shared/styles/themes/components/Sidebar.module.scss';

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
    case 'audit':
      return <ScrollTextIcon aria-hidden="true" />;
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

  const navGroups = NAV_GROUPS_BY_ROLE[effectiveRole ?? 'staff'];
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
