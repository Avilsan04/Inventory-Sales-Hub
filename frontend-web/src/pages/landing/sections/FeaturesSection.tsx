import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PackageIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  ZapIcon,
  GlobeIcon,
  UsersIcon,
} from 'lucide-react';

import styles from '@shared/styles/themes/pages/Landing.module.scss';

interface Feature {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const FEATURES: Feature[] = [
  {
    icon: <PackageIcon aria-hidden="true" />,
    titleKey: 'landing.features.inventory.title',
    descriptionKey: 'landing.features.inventory.description',
  },
  {
    icon: <BarChart3Icon aria-hidden="true" />,
    titleKey: 'landing.features.analytics.title',
    descriptionKey: 'landing.features.analytics.description',
  },
  {
    icon: <ShieldCheckIcon aria-hidden="true" />,
    titleKey: 'landing.features.security.title',
    descriptionKey: 'landing.features.security.description',
  },
  {
    icon: <ZapIcon aria-hidden="true" />,
    titleKey: 'landing.features.realtime.title',
    descriptionKey: 'landing.features.realtime.description',
  },
  {
    icon: <GlobeIcon aria-hidden="true" />,
    titleKey: 'landing.features.multiplatform.title',
    descriptionKey: 'landing.features.multiplatform.description',
  },
  {
    icon: <UsersIcon aria-hidden="true" />,
    titleKey: 'landing.features.collaboration.title',
    descriptionKey: 'landing.features.collaboration.description',
  },
];

export function FeaturesSection(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <section className={styles['features']} aria-labelledby="features-heading">
      <div className={styles['sectionHeader']}>
        <h2 id="features-heading" className={styles['sectionTitle']}>
          {t('landing.features.title')}
        </h2>
        <p className={styles['sectionSubtitle']}>
          {t('landing.features.subtitle')}
        </p>
      </div>

      <div className={styles['featuresGrid']}>
        {FEATURES.map((feature) => (
          <article key={feature.titleKey} className={styles['featureCard']}>
            <div className={styles['featureIcon']}>{feature.icon}</div>
            <h3 className={styles['featureTitle']}>{t(feature.titleKey)}</h3>
            <p className={styles['featureDescription']}>{t(feature.descriptionKey)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
