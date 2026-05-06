import * as React from 'react';
import {
  SunIcon,
  GlobeIcon,
  BellIcon,
  UserIcon,
  BuildingIcon,
  ContrastIcon,
  ZapOffIcon,
  InfoIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useTheme } from '@shared/hooks/useTheme';
import { useLanguageAdapter } from '@shared/adapters/useLanguageAdapter';
import {
  useSettings,
  type AccentColor,
  type DisplayScale,
  type Density,
} from '@shared/hooks/useSettings';
import { useEffectiveRole } from '@features/auth';
import { toast } from '@shared/hooks/useToast';
import {
  Switch,
  Button,
  Input,
  Label,
  SegmentedControl,
  type SegmentedOption,
} from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
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

const ACCENT_SWATCHES: Array<{ value: AccentColor; color: string }> = [
  { value: 'blue', color: '#2563eb' },
  { value: 'green', color: '#10b981' },
  { value: 'purple', color: '#8b5cf6' },
  { value: 'slate', color: '#64748b' },
  { value: 'rose', color: '#f43f5e' },
];

const NOTIF_OPTIONS: Array<{
  key: keyof Pick<
    ReturnType<typeof useSettings>['settings'],
    'notificationsInfo' | 'notificationsWarning' | 'notificationsError' | 'notificationsSuccess'
  >;
  labelKey: string;
  descKey: string;
  color: string;
}> = [
  {
    key: 'notificationsInfo',
    labelKey: 'settings.infoNotifications',
    descKey: 'settings.infoNotificationsDesc',
    color: '#3b82f6',
  },
  {
    key: 'notificationsWarning',
    labelKey: 'settings.warningNotifications',
    descKey: 'settings.warningNotificationsDesc',
    color: '#f59e0b',
  },
  {
    key: 'notificationsError',
    labelKey: 'settings.errorNotifications',
    descKey: 'settings.errorNotificationsDesc',
    color: '#ef4444',
  },
  {
    key: 'notificationsSuccess',
    labelKey: 'settings.successNotifications',
    descKey: 'settings.successNotificationsDesc',
    color: '#22c55e',
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

  const themeOptions: SegmentedOption<'light' | 'dark' | 'system'>[] = [
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
    { value: 'system', label: t('settings.themeSystem') },
  ];

  const scaleOptions: SegmentedOption<DisplayScale>[] = [
    { value: 'sm', label: t('settings.scaleSm') },
    { value: 'md', label: t('settings.scaleMd') },
    { value: 'lg', label: t('settings.scaleLg') },
  ];

  const densityOptions: SegmentedOption<Density>[] = [
    { value: 'comfortable', label: t('settings.densityComfortable') },
    { value: 'compact', label: t('settings.densityCompact') },
  ];

  const langOptions: SegmentedOption<'en' | 'es'>[] = [
    { value: 'en', label: t('settings.langEnglish') },
    { value: 'es', label: t('settings.langSpanish') },
  ];

  function handleSavePreferences(): void {
    toast({ title: t('common.saveChanges') });
  }

  function handleResetDefaults(): void {
    resetSettings();
    setTheme('system');
    toast({ title: t('settings.resetAction') });
  }

  function handleLangChange(val: 'en' | 'es'): void {
    if (val !== language) toggleLanguage();
  }

  const sectionDescKey: Record<SettingsSection, string> = {
    appearance: 'settings.appearanceDesc',
    language: 'settings.languageDesc',
    notifications: 'settings.notificationsPageDesc',
    account: 'settings.accountDesc',
    company: 'settings.companyDesc',
  };

  const sectionTitleKey: Record<SettingsSection, string> = {
    appearance: 'settings.nav.appearance',
    language: 'settings.nav.language',
    notifications: 'settings.nav.notifications',
    account: 'settings.nav.account',
    company: 'settings.nav.company',
  };

  return (
    <div className={baseStyles['page']}>
      <header className={baseStyles['header']}>
        <h1 className={baseStyles['title']}>{t('nav.settings')}</h1>
        <p className={baseStyles['subtitle']}>{t('topbar.subtitle.settings')}</p>
      </header>

      <div className={styles.layout}>
        {/* Secondary nav */}
        <nav className={styles.nav} aria-label="Settings sections">
          {NAV_ITEMS.filter(({ adminOnly }) => !adminOnly || isAdminOrCompany).map(
            ({ id, labelKey, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActive(id);
                }}
                className={cn(styles.navItem, active === id && styles.navItemActive)}
                aria-current={active === id ? 'page' : undefined}
              >
                <span className={styles.navIcon}>{icon}</span>
                <span>{t(labelKey)}</span>
              </button>
            )
          )}
        </nav>

        {/* Content area */}
        <div className={styles.content}>
          {/* Section header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t(sectionTitleKey[active])}</h2>
            <p className={styles.sectionDesc}>{t(sectionDescKey[active])}</p>
          </div>

          {/* ── Appearance ── */}
          {active === 'appearance' && (
            <>
              <div className={styles.mainCard}>
                {/* Theme */}
                <div className={styles.cardSection}>
                  <div className={styles.fieldHeader}>
                    <span className={styles.fieldTitle}>{t('settings.themeMode')}</span>
                    <span className={styles.fieldDesc}>{t('settings.themeModeDesc')}</span>
                  </div>
                  <SegmentedControl options={themeOptions} value={theme} onChange={setTheme} />
                </div>

                {/* Accent color */}
                <div className={styles.cardSection}>
                  <div className={styles.fieldHeader}>
                    <span className={styles.fieldTitle}>{t('settings.accentColor')}</span>
                    <span className={styles.fieldDesc}>{t('settings.accentColorDesc')}</span>
                  </div>
                  <div className={styles.swatches}>
                    {ACCENT_SWATCHES.map(({ value, color }) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={value}
                        aria-pressed={settings.accentColor === value}
                        className={cn(
                          styles.swatch,
                          settings.accentColor === value && styles.swatchActive
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateSettings({ accentColor: value });
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Display scaling */}
                <div className={styles.cardSection}>
                  <div className={styles.fieldHeader}>
                    <span className={styles.fieldTitle}>{t('settings.displayScale')}</span>
                    <span className={styles.fieldDesc}>{t('settings.displayScaleDesc')}</span>
                  </div>
                  <SegmentedControl
                    options={scaleOptions}
                    value={settings.displayScale}
                    onChange={(val) => {
                      updateSettings({ displayScale: val });
                    }}
                  />
                </div>

                {/* Interface density */}
                <div className={styles.cardSection}>
                  <div className={styles.fieldHeader}>
                    <span className={styles.fieldTitle}>{t('settings.density')}</span>
                    <span className={styles.fieldDesc}>{t('settings.densityDesc')}</span>
                  </div>
                  <SegmentedControl
                    options={densityOptions}
                    value={settings.density}
                    onChange={(val) => {
                      updateSettings({ density: val });
                    }}
                  />
                </div>

                <div className={styles.cardFooter}>
                  <Button variant="outline" size="sm" onClick={handleResetDefaults}>
                    {t('settings.resetDefaults')}
                  </Button>
                  <Button size="sm" onClick={handleSavePreferences}>
                    {t('settings.savePreferences')}
                  </Button>
                </div>
              </div>

              {/* Accessibility cards */}
              <div className={styles.accessGrid}>
                <div className={styles.accessCard}>
                  <div className={styles.accessIconWrap}>
                    <ContrastIcon size={20} aria-hidden="true" />
                  </div>
                  <div className={styles.accessInfo}>
                    <span className={styles.accessTitle}>{t('settings.contrast')}</span>
                    <span className={styles.accessDesc}>{t('settings.contrastDesc')}</span>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked: boolean) => {
                      updateSettings({ highContrast: checked });
                    }}
                  />
                </div>

                <div className={styles.accessCard}>
                  <div className={styles.accessIconWrap}>
                    <ZapOffIcon size={20} aria-hidden="true" />
                  </div>
                  <div className={styles.accessInfo}>
                    <span className={styles.accessTitle}>{t('settings.motion')}</span>
                    <span className={styles.accessDesc}>{t('settings.motionDesc')}</span>
                  </div>
                  <Switch
                    checked={settings.reduceMotion}
                    onCheckedChange={(checked: boolean) => {
                      updateSettings({ reduceMotion: checked });
                    }}
                  />
                </div>
              </div>

              {/* Enterprise info box */}
              <div className={styles.infoBox}>
                <p className={styles.infoBoxText}>
                  <InfoIcon size={16} aria-hidden="true" />
                  {t('settings.enterpriseTheme')}
                </p>
                <a href="#" className={styles.infoBoxLink}>
                  {t('settings.contactAdmin')}
                  <ExternalLinkIcon size={14} aria-hidden="true" />
                </a>
              </div>
            </>
          )}

          {/* ── Language ── */}
          {active === 'language' && (
            <div className={styles.mainCard}>
              <div className={styles.cardSection}>
                <div className={styles.fieldHeader}>
                  <span className={styles.fieldTitle}>{t('settings.languageSectionTitle')}</span>
                  <span className={styles.fieldDesc}>{t('settings.languageSectionDesc')}</span>
                </div>
                <SegmentedControl
                  options={langOptions}
                  value={language as 'en' | 'es'}
                  onChange={handleLangChange}
                />
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {active === 'notifications' && (
            <div className={styles.mainCard}>
              <div className={styles.cardSection}>
                {NOTIF_OPTIONS.map((item) => (
                  <div key={item.key} className={styles.toggleRow}>
                    <div className={styles.toggleLeft}>
                      <span className={styles.notifDot} style={{ backgroundColor: item.color }} />
                      <div className={styles.toggleLabels}>
                        <span className={styles.toggleTitle}>{t(item.labelKey)}</span>
                        <span className={styles.toggleDesc}>{t(item.descKey)}</span>
                      </div>
                    </div>
                    <Switch
                      checked={settings[item.key]}
                      onCheckedChange={(checked: boolean) => {
                        updateSettings({ [item.key]: checked });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Account ── */}
          {active === 'account' && (
            <div className={styles.mainCard}>
              <div className={styles.cardSection}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleLabels}>
                    <span className={styles.toggleTitle}>{t('settings.resetPreferences')}</span>
                    <span className={styles.toggleDesc}>{t('settings.resetPreferencesDesc')}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetSettings}>
                    {t('settings.resetAction')}
                  </Button>
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleLabels}>
                    <span className={styles.dangerTitle}>{t('settings.deleteAccount')}</span>
                    <span className={styles.toggleDesc}>{t('settings.deleteAccountDesc')}</span>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    {t('settings.deleteAccount')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Company ── */}
          {active === 'company' && isAdminOrCompany && (
            <div className={styles.mainCard}>
              <div className={styles.cardSection}>
                <div className={styles.companyForm}>
                  <div className={styles.formField}>
                    <Label htmlFor="companyName">{t('settings.companyName')}</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCompanyName(e.target.value);
                      }}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="logoUrl">{t('settings.logoUrl')}</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={logoUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLogoUrl(e.target.value);
                      }}
                      placeholder="https://..."
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="currency">{t('settings.defaultCurrency')}</Label>
                    <Input
                      id="currency"
                      value={currency}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCurrency(e.target.value);
                      }}
                      maxLength={3}
                      style={{ maxWidth: '8rem' }}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                    <Input
                      id="timezone"
                      value={timezone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTimezone(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.cardFooter}>
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
          )}
        </div>
      </div>
    </div>
  );
}
