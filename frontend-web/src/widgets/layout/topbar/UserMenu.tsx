import * as React from 'react';
import { UserIcon, SettingsIcon, LogOutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/composed';
import { Avatar, AvatarFallback } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import { useAuthMe, useLogout, useEffectiveRole } from '@features/auth';
import { useViewMode, type ViewRole } from '@features/auth/context/ViewModeContext';
import type { UserRole } from '@features/auth/models/auth.types';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

const VISTA_ROLES: ReadonlyArray<UserRole> = ['company', 'admin', 'manager', 'staff', 'customer'];
const VISTA_ALLOWED_ROLES: ReadonlyArray<UserRole> = ['company', 'admin', 'manager', 'test'];

const ROLE_CHIP_CLASS: Record<UserRole, string> = {
  admin: styles['roleChipAdmin'] ?? '',
  manager: styles['roleChipManager'] ?? '',
  staff: styles['roleChipStaff'] ?? '',
  company: styles['roleChipCompany'] ?? '',
  customer: styles['roleChipCustomer'] ?? '',
  test: styles['roleChipTest'] ?? '',
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
  company: 'Company',
  customer: 'Customer',
  test: 'Test',
};

export function UserMenu(): React.ReactElement {
  const { data: user } = useAuthMe();
  const role = useEffectiveRole();
  const logout = useLogout();
  const navigate = useNavigate();
  const { viewAs, setViewAs } = useViewMode();

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={styles['userMenuTrigger']} aria-label="Menú de usuario">
          <Avatar className={styles['avatar']}>
            <AvatarFallback className={styles['avatarFallback']}>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={styles['userMenuContent']}>
        <div className={styles['userMenuHeader']}>
          <Avatar className={styles['avatarLg']}>
            <AvatarFallback className={styles['avatarFallbackLg']}>{initials}</AvatarFallback>
          </Avatar>
          <div className={styles['userInfo']}>
            <span className={styles['userName']}>{user?.username ?? '—'}</span>
            <span className={styles['userEmail']}>{user?.email ?? '—'}</span>
            {role && (
              <span className={cn(styles['roleChip'], ROLE_CHIP_CLASS[role])}>
                {ROLE_LABELS[role]}
              </span>
            )}
          </div>
        </div>

        {!!user?.role && VISTA_ALLOWED_ROLES.includes(user.role) && (
          <>
            <DropdownMenuSeparator />
            <div className={styles['devSwitcher']}>
              <span className={styles['devLabel']}>Vista</span>
              <Select
                value={viewAs}
                onValueChange={(v: string) => {
                  setViewAs(v as ViewRole);
                }}
              >
                <SelectTrigger size="sm" aria-label="Cambiar vista de rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISTA_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void navigate(APP_ROUTES.PROFILE)}>
          <UserIcon aria-hidden="true" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void navigate(APP_ROUTES.SETTINGS)}>
          <SettingsIcon aria-hidden="true" />
          Ajustes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout} variant="destructive">
          <LogOutIcon aria-hidden="true" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
