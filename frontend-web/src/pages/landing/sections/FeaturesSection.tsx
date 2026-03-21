import * as React from 'react';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { Reveal } from '@shared/ui/animated';
import { cn } from '@shared/lib/cn';
import {
  PackageIcon,
  BarChart3Icon,
  BellIcon,
  ShieldCheckIcon,
  type LucideIcon,
} from 'lucide-react';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

type FeatureIconKey = 'inventory' | 'dashboards' | 'alerts' | 'security';
type FeatureColorVariant = 'primary' | 'teal' | 'warning';

interface FeatureConfig {
  readonly iconKey: FeatureIconKey;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly colorVariant: FeatureColorVariant;
}

const FEATURE_ICON_MAP: Readonly<Record<FeatureIconKey, LucideIcon>> = {
  inventory: PackageIcon,
  dashboards: BarChart3Icon,
  alerts: BellIcon,
  security: ShieldCheckIcon,
};

const ICON_COLOR_CLASS: Record<FeatureColorVariant, string> = {
  primary: styles['featureIconPrimary'] ?? '',
  teal: styles['featureIconTeal'] ?? '',
  warning: styles['featureIconWarning'] ?? '',
};

const FEATURES: readonly FeatureConfig[] = [
  {
    iconKey: 'inventory',
    titleKey: 'landing.features.inventory.title',
    descriptionKey: 'landing.features.inventory.description',
    colorVariant: 'primary',
  },
  {
    iconKey: 'dashboards',
    titleKey: 'landing.features.dashboards.title',
    descriptionKey: 'landing.features.dashboards.description',
    colorVariant: 'teal',
  },
  {
    iconKey: 'alerts',
    titleKey: 'landing.features.alerts.title',
    descriptionKey: 'landing.features.alerts.description',
    colorVariant: 'warning',
  },
  {
    iconKey: 'security',
    titleKey: 'landing.features.security.title',
    descriptionKey: 'landing.features.security.description',
    colorVariant: 'primary',
  },
] as const;

export function FeaturesSection(): React.ReactElement {
  const { translate } = useTranslationAdapter();

  return (
    <section className={styles['features']} aria-labelledby="features-heading">
      <Reveal direction="fade" className={styles['sectionHeader']}>
        <h2 id="features-heading" className={styles['sectionTitle']}>
          {translate('landing.features.title')}
        </h2>
        <p className={styles['sectionSubtitle']}>{translate('landing.features.subtitle')}</p>
      </Reveal>

      <div className={styles['featuresGrid']}>
        {FEATURES.map((feature, idx) => {
          const Icon = FEATURE_ICON_MAP[feature.iconKey];
          return (
            <Reveal
              key={feature.titleKey}
              as="article"
              delay={idx * 0.1}
              lift
              className={styles['featureCard']}
            >
              <div className={cn(styles['featureIcon'], ICON_COLOR_CLASS[feature.colorVariant])}>
                <Icon aria-hidden="true" />
              </div>
              <h3 className={styles['featureTitle']}>{translate(feature.titleKey)}</h3>
              <p className={styles['featureDescription']}>{translate(feature.descriptionKey)}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
