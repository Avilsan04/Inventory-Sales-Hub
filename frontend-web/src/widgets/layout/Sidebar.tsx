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
  StoreIcon,
  ScrollTextIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useEffectiveRole } from '@features/auth';
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

const NAV_ICON_MAP: Record<NavIconKey, React.ReactElement> = {
  dashboard: <LayoutDashboardIcon aria-hidden="true" />,
  analytics: <TrendingUpIcon aria-hidden="true" />,
  inventory: <WarehouseIcon aria-hidden="true" />,
  products: <TagIcon aria-hidden="true" />,
  sales: <ReceiptIcon aria-hidden="true" />,
  pos: <StoreIcon aria-hidden="true" />,
  myOrders: <ClipboardListIcon aria-hidden="true" />,
  catalog: <LayoutGridIcon aria-hidden="true" />,
  customers: <UsersIcon aria-hidden="true" />,
  employees: <BriefcaseIcon aria-hidden="true" />,
  shipments: <FactoryIcon aria-hidden="true" />,
  notifications: <BellIcon aria-hidden="true" />,
  tenants: <Building2Icon aria-hidden="true" />,
  audit: <ScrollTextIcon aria-hidden="true" />,
  settings: <SlidersHorizontalIcon aria-hidden="true" />,
  profile: <UserRoundIcon aria-hidden="true" />,
};

function renderNavIcon(iconKey: NavIconKey): React.ReactElement {
  return NAV_ICON_MAP[iconKey];
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
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );

  React.useEffect((): (() => void) => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const handler = (e: MediaQueryListEvent): void => {
      setIsMobile(e.matches);
    };
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return (): void => {
      mq.removeEventListener('change', handler);
    };
  }, []);

  const navGroups = NAV_GROUPS_BY_ROLE[effectiveRole ?? 'staff'];

  return (
    <>
      <div
        className={cn(styles['overlay'], isOpen && styles['overlayVisible'])}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(styles['sidebar'], isOpen && styles['sidebarOpen'])}
        aria-label={t('sidebar.mainNavLabel')}
        aria-hidden={isMobile && !isOpen}
        // inert removes the subtree from the a11y tree and tab order when sidebar is off-screen
        inert={(isMobile && !isOpen) || undefined}
      >
        <div className={styles['brand']}>
          <BrandMark size={32} />
          <div className={styles['brandText']}>
            <span className={styles['brandName']}>{t('common.appName')}</span>
            <span className={styles['brandSub']}>{t('common.platformTag')}</span>
          </div>
        </div>

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
