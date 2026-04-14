import * as React from 'react';
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
} from 'lucide-react';

import { useTheme } from '@shared/hooks/useTheme';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { useLogout, useAuthMe } from '@features/auth';
import { Input, Avatar, AvatarFallback, Badge } from '@shared/ui/primitives';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@shared/ui/composed';
import { cn } from '@shared/lib/cn';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/components/TopBar.module.scss';

export interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps): React.ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { translate: t } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();
  const logout = useLogout();
  const { data: user } = useAuthMe();

  const initials = user ? user.username.slice(0, 2).toUpperCase() : '..';

  return (
    <header className={styles['topbar']}>
      <div className={styles['topbarLeft']}>
        <button
          type="button"
          className={cn(styles['iconBtn'], styles['menuBtn'])}
          onClick={onMenuToggle}
          aria-label={t('common.openMenu')}
        >
          <MenuIcon aria-hidden="true" />
        </button>

        <div className={styles['searchWrapper']}>
          <SearchIcon className={styles['searchIcon']} aria-hidden="true" />
          <Input
            type="search"
            placeholder={t('common.search')}
            className={styles['searchInput']}
            aria-label={t('common.search')}
          />
        </div>
      </div>

      <div className={styles['topbarRight']}>
        <div className={styles['notifWrapper']}>
          <button
            type="button"
            className={styles['iconBtn']}
            aria-label={t('nav.notifications')}
          >
            <BellIcon aria-hidden="true" />
          </button>
          <Badge
            variant="destructive"
            className={styles['notifBadge']}
            aria-label="3 unread notifications"
          >
            3
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={styles['avatarBtn']}
              aria-label={t('nav.profile')}
            >
              <Avatar>
                <AvatarFallback className={styles['avatarFallback']}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.username ?? t('nav.profile')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(): void => { navigateTo(APP_ROUTES.PROFILE); }}
            >
              <UserIcon aria-hidden="true" />
              {t('nav.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(): void => { navigateTo(APP_ROUTES.SETTINGS); }}
            >
              <SettingsIcon aria-hidden="true" />
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOutIcon aria-hidden="true" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          className={styles['iconBtn']}
          onClick={toggleTheme}
          aria-label={t('common.toggleTheme')}
          title={t('common.toggleTheme')}
        >
          {theme === 'dark'
            ? <SunIcon aria-hidden="true" />
            : <MoonIcon aria-hidden="true" />
          }
        </button>
      </div>
    </header>
  );
}
