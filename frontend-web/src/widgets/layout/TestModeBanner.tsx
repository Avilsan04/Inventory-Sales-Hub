import * as React from 'react';
import { ShieldIcon, ShoppingBagIcon, BuildingIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useViewMode } from '@features/auth/context/ViewModeContext';
import { ResetDemoDataButton } from '@features/auth/components/ResetDemoDataButton';
import type { ViewRole } from '@features/auth/context/ViewModeContext';
import { APP_ROUTES } from '@shared/config/routes';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/TestModeBanner.module.scss';

interface RoleConfig {
  readonly role: ViewRole;
  readonly labelKey: string;
  readonly icon: React.ReactElement;
  readonly allowedRoutes?: Set<string>; // undefined = unrestricted
}

const ROLE_CONFIGS: ReadonlyArray<RoleConfig> = [
  {
    role: 'admin',
    labelKey: 'common.viewAsAdmin',
    icon: <ShieldIcon aria-hidden="true" />,
  },
  {
    role: 'customer',
    labelKey: 'common.viewAsCustomer',
    icon: <ShoppingBagIcon aria-hidden="true" />,
    allowedRoutes: new Set([
      APP_ROUTES.DASHBOARD,
      APP_ROUTES.SALES,
      APP_ROUTES.PROFILE,
      APP_ROUTES.SETTINGS,
    ]),
  },
  {
    role: 'company',
    labelKey: 'common.viewAsCompany',
    icon: <BuildingIcon aria-hidden="true" />,
    allowedRoutes: new Set([
      APP_ROUTES.DASHBOARD,
      APP_ROUTES.PRODUCTS,
      APP_ROUTES.SALES,
      APP_ROUTES.PROFILE,
      APP_ROUTES.SETTINGS,
    ]),
  },
];

export function TestModeBanner(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { viewAs, setViewAs } = useViewMode();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
    <div className={styles['banner']} role="status" aria-live="polite">
      <span className={styles['label']}>{t('common.testModeBanner')}</span>

      <span className={styles['viewingAs']}>{t('common.viewingAs')}:</span>

      <div className={styles['toggle']}>
        {ROLE_CONFIGS.map(({ role, labelKey, icon }) => (
          <button
            key={role}
            type="button"
            className={cn(styles['toggleBtn'], viewAs === role && styles['toggleBtnActive'])}
            onClick={() => {
              handleSwitch(role);
            }}
            disabled={viewAs === role}
          >
            {icon} {t(labelKey)}
          </button>
        ))}
      </div>
      <ResetDemoDataButton />
    </div>
  );
}
