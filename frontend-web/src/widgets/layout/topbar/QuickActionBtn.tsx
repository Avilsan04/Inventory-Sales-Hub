import * as React from 'react';
import { ShoppingCartIcon, BarChart2Icon, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import { useEffectiveRole } from '@features/auth';
import type { UserRole } from '@features/auth';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

interface QuickAction {
  label: string;
  Icon: LucideIcon;
  route: string;
}

const ROLE_QUICK_ACTIONS: Partial<Record<UserRole, QuickAction>> = {
  admin: { label: 'Nueva venta', Icon: ShoppingCartIcon, route: APP_ROUTES.POS },
  manager: { label: 'Nueva venta', Icon: ShoppingCartIcon, route: APP_ROUTES.POS },
  staff: { label: 'Nueva venta', Icon: ShoppingCartIcon, route: APP_ROUTES.POS },
  company: { label: 'Analytics', Icon: BarChart2Icon, route: APP_ROUTES.ANALYTICS },
};

export function QuickActionBtn(): React.ReactElement | null {
  const role = useEffectiveRole();
  const navigate = useNavigate();

  if (!role) return null;
  const action = ROLE_QUICK_ACTIONS[role];
  if (!action) return null;

  const { label, Icon, route } = action;

  return (
    <Button size="sm" className={styles['quickActionBtn']} onClick={() => void navigate(route)}>
      <Icon aria-hidden="true" />
      <span className={styles['quickActionLabel']}>{label}</span>
    </Button>
  );
}
