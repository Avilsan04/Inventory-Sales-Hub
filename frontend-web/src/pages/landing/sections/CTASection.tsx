import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from 'lucide-react';

import { Button } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <section className={styles['cta']} aria-labelledby="cta-heading">
      <div className={styles['ctaContent']}>
        <h2 id="cta-heading" className={styles['ctaTitle']}>
          {t('landing.cta.title')}
        </h2>
        <p className={styles['ctaDescription']}>
          {t('landing.cta.description')}
        </p>
        <Button size="lg" onClick={onGetStarted}>
          {t('landing.cta.button')}
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
