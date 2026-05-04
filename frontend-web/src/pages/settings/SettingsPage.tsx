import * as React from 'react';
import { MoonIcon, GlobeIcon, BellIcon, UserIcon, SunIcon, BuildingIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useTheme } from '@shared/hooks/useTheme';
import { useLanguageAdapter } from '@shared/adapters/useLanguageAdapter';
import { useSettings } from '@shared/hooks/useSettings';
import { useEffectiveRole } from '@features/auth';
import { toast } from '@shared/hooks/useToast';
import { Switch, Button, Input, Label } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Settings.module.scss';

type SettingsSection = 'appearance' | 'language' | 'notifications' | 'account' | 'company';

const NAV_ITEMS: Array<{
  id: SettingsSection;
  labelKey: string;
  icon: React.ReactElement;
  adminOnly?: boolean;
}> = [
  {
    id: 'appearance',
    labelKey: 'settings.nav.appearance',
    icon: <SunIcon size={16} aria-hidden="true" />,
  },
  {
    id: 'language',
    labelKey: 'settings.nav.language',
    icon: <GlobeIcon size={16} aria-hidden="true" />,
  },
  {
    id: 'notifications',
    labelKey: 'settings.nav.notifications',
    icon: <BellIcon size={16} aria-hidden="true" />,
  },
  {
    id: 'account',
    labelKey: 'settings.nav.account',
    icon: <UserIcon size={16} aria-hidden="true" />,
  },
  {
    id: 'company',
    labelKey: 'settings.nav.company',
    icon: <BuildingIcon size={16} aria-hidden="true" />,
    adminOnly: true,
  },
];

const THEME_OPTIONS = [
  { key: 'light' as const, labelKey: 'settings.themeLight', cls: 'previewLight' },
  { key: 'dark' as const, labelKey: 'settings.themeDark', cls: 'previewDark' },
  { key: 'accent' as const, labelKey: 'settings.themeAccent', cls: 'previewAccent' },
];

const NOTIFICATION_OPTIONS = [
  {
    key: 'notificationsInfo' as const,
    labelKey: 'settings.infoNotifications',
    descKey: 'settings.infoNotificationsDesc',
  },
  {
    key: 'notificationsWarning' as const,
    labelKey: 'settings.warningNotifications',
    descKey: 'settings.warningNotificationsDesc',
  },
  {
    key: 'notificationsError' as const,
    labelKey: 'settings.errorNotifications',
    descKey: 'settings.errorNotificationsDesc',
  },
  {
    key: 'notificationsSuccess' as const,
    labelKey: 'settings.successNotifications',
    descKey: 'settings.successNotificationsDesc',
  },
];

export function SettingsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage } = useLanguageAdapter();
  const { settings, updateSettings, resetSettings } = useSettings();
  const role = useEffectiveRole();
  const isAdminOrCompany = role === 'admin' || role === 'company' || role === 'manager';

  const [active, setActive] = React.useState<SettingsSection>('appearance');
  const [companyName, setCompanyName] = React.useState('Inventory Sales Hub');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [currency, setCurrency] = React.useState('EUR');
  const [timezone, setTimezone] = React.useState('Europe/Madrid');

  return (
    <div className={baseStyles['page']}>
      <header className={baseStyles['header']}>
        <h1 className={baseStyles['title']}>{t('nav.settings')}</h1>
        <p className={baseStyles['subtitle']}>{t('topbar.subtitle.settings')}</p>
      </header>

      <div className={styles['layout']}>
        {/* Secondary nav */}
        <nav className={styles['nav']} aria-label="Settings sections">
          {NAV_ITEMS.filter(({ adminOnly }) => !adminOnly || isAdminOrCompany).map(
            ({ id, labelKey, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActive(id);
                }}
                className={cn(styles['navItem'], active === id && styles['navItemActive'])}
                aria-current={active === id ? 'page' : undefined}
              >
                <span className={styles['navIcon']}>{icon}</span>
                <span>{t(labelKey)}</span>
              </button>
            )
          )}
        </nav>

        {/* Content panel */}
        <div className={styles['content']}>
          {active === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.nav.appearance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles['fieldRow']}>
                  <div className={styles['fieldRowLeft']}>
                    <div className={styles['darkModeIconWrap']}>
                      <MoonIcon size={20} aria-hidden="true" />
                    </div>
                    <div className={styles['labelStack']}>
                      <span className={styles['labelTitle']}>{t('settings.darkMode')}</span>
                      <span className={styles['labelDesc']}>{t('settings.darkModeDesc')}</span>
                    </div>
                  </div>
                  <Switch
                    id="theme-toggle"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked: boolean) => {
                      setTheme(checked ? 'dark' : 'light');
                    }}
                  />
                </div>
                <div className={styles['fieldRowLast']}>
                  <div className={styles['labelStack']}>
                    <span className={styles['labelTitle']}>{t('settings.currentTheme')}</span>
                    <span className={styles['labelDesc']}>{t('settings.currentThemeDesc')}</span>
                  </div>
                </div>
                <div className={styles['themeCards']}>
                  {THEME_OPTIONS.map(({ key, labelKey, cls }) => {
                    const label = t(labelKey);
                    return (
                      <div
                        key={key}
                        className={styles['themeCard']}
                        onClick={() => {
                          if (key !== 'accent') setTheme(key);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={t('settings.selectThemeAria', { label })}
                      >
                        <div
                          className={cn(
                            styles['themePreview'],
                            styles[cls],
                            theme === key && styles['themePreviewActive']
                          )}
                        >
                          <div className={styles['themePreviewSidebar']} />
                          <div className={styles['themePreviewContent']}>
                            <div className={styles['themePreviewRow']} />
                            <div className={styles['themePreviewRow']} />
                            <div className={styles['themePreviewRow']} />
                          </div>
                        </div>
                        <span className={styles['themeLabel']}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.nav.language')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles['fieldRowLast']}>
                  <div className={styles['labelStack']}>
                    <span className={styles['labelTitle']}>{t('common.switchLanguage')}</span>
                    <span className={styles['labelDesc']}>
                      {t('settings.currentLanguage', {
                        lang:
                          language === 'en' ? t('settings.langEnglish') : t('settings.langSpanish'),
                      })}
                    </span>
                  </div>
                  <div className={styles['langButtons']}>
                    <Button
                      variant={language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (language !== 'en') toggleLanguage();
                      }}
                    >
                      {t('settings.langEnglish')}
                    </Button>
                    <Button
                      variant={language === 'es' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (language !== 'es') toggleLanguage();
                      }}
                    >
                      {t('settings.langSpanish')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('notifications.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                {NOTIFICATION_OPTIONS.map((item, i, arr) => (
                  <div
                    key={item.key}
                    className={i < arr.length - 1 ? styles['fieldRow'] : styles['fieldRowLast']}
                  >
                    <div className={styles['labelStack']}>
                      <span className={styles['labelTitle']}>{t(item.labelKey)}</span>
                      <span className={styles['labelDesc']}>{t(item.descKey)}</span>
                    </div>
                    <Switch
                      checked={settings[item.key]}
                      onCheckedChange={(checked: boolean) => {
                        updateSettings({ [item.key]: checked });
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === 'company' && isAdminOrCompany && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.nav.company')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <Label htmlFor="companyName">{t('settings.companyName')}</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCompanyName(e.target.value);
                      }}
                      style={{ marginTop: '0.375rem' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logoUrl">{t('settings.logoUrl')}</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={logoUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLogoUrl(e.target.value);
                      }}
                      placeholder="https://..."
                      style={{ marginTop: '0.375rem' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">{t('settings.defaultCurrency')}</Label>
                    <Input
                      id="currency"
                      value={currency}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCurrency(e.target.value);
                      }}
                      maxLength={3}
                      style={{ marginTop: '0.375rem', maxWidth: '8rem' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                    <Input
                      id="timezone"
                      value={timezone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTimezone(e.target.value);
                      }}
                      style={{ marginTop: '0.375rem' }}
                    />
                  </div>
                  <div>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast({ title: t('common.saveChanges') });
                      }}
                    >
                      {t('common.saveChanges')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.nav.account')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles['fieldRow']}>
                  <div className={styles['labelStack']}>
                    <span className={styles['labelTitle']}>{t('settings.resetPreferences')}</span>
                    <span className={styles['labelDesc']}>
                      {t('settings.resetPreferencesDesc')}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetSettings}>
                    {t('settings.resetAction')}
                  </Button>
                </div>
                <div className={styles['fieldRowLast']}>
                  <div className={styles['labelStack']}>
                    <span className={styles['labelTitleDanger']}>
                      {t('settings.deleteAccount')}
                    </span>
                    <span className={styles['labelDesc']}>{t('settings.deleteAccountDesc')}</span>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    {t('settings.deleteAccount')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
