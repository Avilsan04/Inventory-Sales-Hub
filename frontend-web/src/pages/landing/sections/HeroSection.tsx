import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PackageIcon, ArrowRightIcon } from 'lucide-react';

import { Button } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <section className={styles['hero']} aria-labelledby="hero-heading">
      <div className={styles['heroBackground']} aria-hidden="true">
        <div className={styles['heroGlow']} />
        <div className={styles['heroGrid']} />
      </div>

      <div className={styles['heroContent']}>
        <div className={styles['heroBadge']}>
          <PackageIcon aria-hidden="true" />
          <span>{t('landing.hero.badge')}</span>
        </div>

        <h1 id="hero-heading" className={styles['heroTitle']}>
          {t('landing.hero.titleLine1')}
          <span className={styles['heroTitleAccent']}>
            {t('landing.hero.titleAccent')}
          </span>
        </h1>

        <p className={styles['heroDescription']}>
          {t('landing.hero.description')}
        </p>

        <div className={styles['heroActions']}>
          <Button size="lg" onClick={onGetStarted}>
            {t('landing.hero.cta')}
            <ArrowRightIcon aria-hidden="true" />
          </Button>
          <Button variant="outline" size="lg" onClick={onGetStarted}>
            {t('landing.hero.secondaryCta')}
          </Button>
        </div>
      </div>
    </section>
  );
}
