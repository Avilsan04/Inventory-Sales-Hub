import * as React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, UserIcon, ShieldCheckIcon, Building2Icon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { RegisterForm } from '@features/auth';
import type { RegisterRole } from '@features/auth';
import { SegmentedControl } from '@shared/ui/primitives';
import type { SegmentedOption } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardDescription, AuthPageHeader } from '@shared/ui/composed';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/pages/Register.module.scss';

const TABS: ReadonlyArray<{ role: RegisterRole; labelKey: string }> = [
  { role: 'customer', labelKey: 'auth.tabUser' },
  { role: 'admin', labelKey: 'auth.tabAdmin' },
  { role: 'company', labelKey: 'auth.tabCompany' },
];

const ROLE_META: Record<RegisterRole, { titleKey: string; subtitleKey: string; Icon: LucideIcon }> =
  {
    customer: {
      titleKey: 'auth.registerTitleCustomer',
      subtitleKey: 'auth.registerSubtitleCustomer',
      Icon: UserIcon,
    },
    admin: {
      titleKey: 'auth.registerTitleAdmin',
      subtitleKey: 'auth.registerSubtitleAdmin',
      Icon: ShieldCheckIcon,
    },
    company: {
      titleKey: 'auth.registerTitleCompany',
      subtitleKey: 'auth.registerSubtitleCompany',
      Icon: Building2Icon,
    },
  };

const BRAND_FEATURES = ['auth.brandFeature1', 'auth.brandFeature2', 'auth.brandFeature3'] as const;

export function RegisterPage(): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();

  const [activeTab, setActiveTab] = React.useState<RegisterRole>('customer');

  const tabOptions: ReadonlyArray<SegmentedOption<RegisterRole>> = React.useMemo(
    () => TABS.map(({ role, labelKey }) => ({ value: role, label: translate(labelKey) })),
    [translate]
  );

  const handleRegisterSuccess = React.useCallback((): void => {
    navigateTo(APP_ROUTES.DASHBOARD, true);
  }, [navigateTo]);

  const handleBackToLanding = React.useCallback((): void => {
    navigateTo(APP_ROUTES.LANDING);
  }, [navigateTo]);

  const { titleKey, subtitleKey, Icon: RoleIcon } = ROLE_META[activeTab];

  return (
    <div className={styles.page}>
      <AuthPageHeader onLogoClick={handleBackToLanding} forceDarkLogo />

      <main className={styles.main}>
        {/* ── Brand panel (left, hidden on mobile) ───────────────── */}
        <aside className={styles.brandPanel} aria-hidden="true">
          <p className={styles.brandTagline}>{translate('auth.brandTagline')}</p>

          <ul className={styles.brandFeatures}>
            {BRAND_FEATURES.map((key) => (
              <li key={key} className={styles.brandFeatureItem}>
                <span className={styles.brandFeatureIconWrap}>
                  <CheckIcon size={14} aria-hidden="true" />
                </span>
                <span>{translate(key)}</span>
              </li>
            ))}
          </ul>

          <div className={styles.brandRoleCard}>
            <div className={styles.brandRoleCardHeader}>
              <span className={styles.brandRoleIconWrap}>
                <RoleIcon size={20} aria-hidden="true" />
              </span>
              <h3 className={styles.brandRoleTitle}>{translate(titleKey)}</h3>
            </div>
            <p className={styles.brandRoleDesc}>{translate(subtitleKey)}</p>
          </div>
        </aside>

        {/* ── Form panel (right) ─────────────────────────────────── */}
        <div className={styles.formPanel}>
          <Card className={styles.formCard}>
            <CardHeader className={styles.formCardHeader}>
              <CardTitle>{translate(titleKey)}</CardTitle>
              <CardDescription>{translate(subtitleKey)}</CardDescription>
            </CardHeader>

            <div className={styles.segmentedWrapper}>
              <SegmentedControl<RegisterRole>
                options={tabOptions}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            <RegisterForm key={activeTab} role={activeTab} onSuccess={handleRegisterSuccess} />
          </Card>

          <p className={styles.loginPrompt}>
            {translate('auth.alreadyHaveAccount')}{' '}
            <Link to={APP_ROUTES.LOGIN} className={styles.loginLink}>
              {translate('auth.login')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
