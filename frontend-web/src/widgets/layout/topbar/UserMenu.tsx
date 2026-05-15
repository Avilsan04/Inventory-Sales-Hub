import * as React from 'react';
import { UserIcon, SettingsIcon, LogOutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/composed';
import { Avatar, AvatarFallback, Button } from '@shared/ui/primitives';
import { APP_ROUTES } from '@shared/config/routes';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe, useLogout, useEffectiveRole } from '@features/auth';
import { useViewMode, type ViewRole } from '@features/auth';
import type { UserRole } from '@features/auth';
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
  const { translate: t } = useTranslationAdapter();
  const { data: user } = useAuthMe();
  const role = useEffectiveRole();
  const logout = useLogout();
  const navigate = useNavigate();
  const { viewAs, setViewAs } = useViewMode();

  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      // Exclude Radix portals (e.g., Select dropdown inside the menu)
      if (
        target instanceof Element &&
        target.closest('[data-radix-popper-content-wrapper]') !== null
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return (): void => {
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  const close = (): void => {
    setOpen(false);
  };

  return (
    <div ref={menuRef} className={styles['userMenuContainer']}>
      <Button
        variant="ghost"
        className={styles['userMenuTrigger']}
        aria-label={t('nav.profile')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
        }}
      >
        <Avatar className={styles['avatar']}>
          <AvatarFallback className={styles['avatarFallback']}>{initials}</AvatarFallback>
        </Avatar>
      </Button>

      {open && (
        <div className={styles['userMenuDropdown']} role="menu">
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
              <div className={styles['userMenuSeparator']} />
              <div className={styles['devSwitcher']}>
                <span className={styles['devLabel']}>Vista</span>
                <Select
                  value={viewAs}
                  onValueChange={(v: string) => {
                    setViewAs(v as ViewRole);
                  }}
                >
                  <SelectTrigger size="sm" aria-label={t('topbar.changeRoleView')}>
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

          <div className={styles['userMenuSeparator']} />
          <button
            role="menuitem"
            className={styles['userMenuItem']}
            onClick={() => {
              void navigate(APP_ROUTES.PROFILE);
              close();
            }}
          >
            <UserIcon aria-hidden="true" />
            Perfil
          </button>
          <button
            role="menuitem"
            className={styles['userMenuItem']}
            onClick={() => {
              void navigate(APP_ROUTES.SETTINGS);
              close();
            }}
          >
            <SettingsIcon aria-hidden="true" />
            Ajustes
          </button>
          <div className={styles['userMenuSeparator']} />
          <button
            role="menuitem"
            className={cn(styles['userMenuItem'], styles['userMenuItemDestructive'])}
            onClick={() => {
              logout();
              close();
            }}
          >
            <LogOutIcon aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
