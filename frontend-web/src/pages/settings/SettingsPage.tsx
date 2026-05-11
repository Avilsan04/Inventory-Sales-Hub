import * as React from 'react';
import { SunIcon, GlobeIcon, BellIcon, UserIcon, BuildingIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useEffectiveRole } from '@features/auth';
import { cn } from '@shared/lib/cn';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Settings.module.scss';
import { AppearanceSection } from './sections/AppearanceSection';
import { LanguageSection } from './sections/LanguageSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { AccountSection } from './sections/AccountSection';
import { CompanySection } from './sections/CompanySection';

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

const SECTION_TITLE_KEY: Record<SettingsSection, string> = {
  appearance: 'settings.nav.appearance',
  language: 'settings.nav.language',
  notifications: 'settings.nav.notifications',
  account: 'settings.nav.account',
  company: 'settings.nav.company',
};

const SECTION_DESC_KEY: Record<SettingsSection, string> = {
  appearance: 'settings.appearanceDesc',
  language: 'settings.languageDesc',
  notifications: 'settings.notificationsPageDesc',
  account: 'settings.accountDesc',
  company: 'settings.companyDesc',
};

const SECTION_COMPONENTS: Record<SettingsSection, React.ReactElement> = {
  appearance: <AppearanceSection />,
  language: <LanguageSection />,
  notifications: <NotificationsSection />,
  account: <AccountSection />,
  company: <CompanySection />,
};

export function SettingsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const role = useEffectiveRole();
  const isAdminOrCompany = role === 'admin' || role === 'company' || role === 'manager';
  const [active, setActive] = React.useState<SettingsSection>('appearance');

  return (
    <div className={baseStyles['page']}>
      <header className={baseStyles['header']}>
        <div>
          <h1 className={baseStyles['title']}>{t('nav.settings')}</h1>
          <p className={baseStyles['subtitle']}>{t('topbar.subtitle.settings')}</p>
        </div>
      </header>

      <div className={styles.layout}>
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

        <div className={styles.content}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t(SECTION_TITLE_KEY[active])}</h2>
            <p className={styles.sectionDesc}>{t(SECTION_DESC_KEY[active])}</p>
          </div>
          {active === 'company' && !isAdminOrCompany ? null : SECTION_COMPONENTS[active]}
        </div>
      </div>
    </div>
  );
}
