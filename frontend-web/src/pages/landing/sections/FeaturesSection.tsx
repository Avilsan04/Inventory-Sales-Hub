import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PackageIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  ZapIcon,
  GlobeIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';

import styles from '@shared/styles/themes/pages/Landing.module.scss';

type FeatureIconKey =
  | 'inventory'
  | 'analytics'
  | 'security'
  | 'realtime'
  | 'multiplatform'
  | 'collaboration';

interface FeatureConfig {
  readonly iconKey: FeatureIconKey;
  readonly titleKey: string;
  readonly descriptionKey: string;
}

const FEATURE_ICON_MAP: Readonly<Record<FeatureIconKey, LucideIcon>> = {
  inventory: PackageIcon,
  analytics: BarChart3Icon,
  security: ShieldCheckIcon,
  realtime: ZapIcon,
  multiplatform: GlobeIcon,
  collaboration: UsersIcon,
};

const FEATURES: readonly FeatureConfig[] = [
  {
    iconKey: 'inventory',
    titleKey: 'landing.features.inventory.title',
    descriptionKey: 'landing.features.inventory.description',
  },
  {
    iconKey: 'analytics',
    titleKey: 'landing.features.analytics.title',
    descriptionKey: 'landing.features.analytics.description',
  },
  {
    iconKey: 'security',
    titleKey: 'landing.features.security.title',
    descriptionKey: 'landing.features.security.description',
  },
  {
    iconKey: 'realtime',
    titleKey: 'landing.features.realtime.title',
    descriptionKey: 'landing.features.realtime.description',
  },
  {
    iconKey: 'multiplatform',
    titleKey: 'landing.features.multiplatform.title',
    descriptionKey: 'landing.features.multiplatform.description',
  },
  {
    iconKey: 'collaboration',
    titleKey: 'landing.features.collaboration.title',
    descriptionKey: 'landing.features.collaboration.description',
  },
] as const;

export function FeaturesSection(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <section className={styles['features']} aria-labelledby="features-heading">
      <div className={styles['sectionHeader']}>
        <h2 id="features-heading" className={styles['sectionTitle']}>
          {t('landing.features.title')}
        </h2>
        <p className={styles['sectionSubtitle']}>{t('landing.features.subtitle')}</p>
      </div>

      <div className={styles['featuresGrid']}>
        {FEATURES.map((feature) => {
          const Icon = FEATURE_ICON_MAP[feature.iconKey];
          return (
            <article key={feature.titleKey} className={styles['featureCard']}>
              <div className={styles['featureIcon']}>
                <Icon aria-hidden="true" />
              </div>
              <h3 className={styles['featureTitle']}>{t(feature.titleKey)}</h3>
              <p className={styles['featureDescription']}>{t(feature.descriptionKey)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
