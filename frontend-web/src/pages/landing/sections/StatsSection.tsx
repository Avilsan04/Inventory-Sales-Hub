import * as React from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@shared/styles/themes/pages/Landing.module.scss';

interface Stat {
  valueKey: string;
  labelKey: string;
}

const STATS: Stat[] = [
  { valueKey: 'landing.stats.products.value', labelKey: 'landing.stats.products.label' },
  { valueKey: 'landing.stats.transactions.value', labelKey: 'landing.stats.transactions.label' },
  { valueKey: 'landing.stats.uptime.value', labelKey: 'landing.stats.uptime.label' },
  { valueKey: 'landing.stats.support.value', labelKey: 'landing.stats.support.label' },
];

export function StatsSection(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <section className={styles['stats']} aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        {t('landing.stats.srTitle')}
      </h2>
      <div className={styles['statsGrid']}>
        {STATS.map((stat) => (
          <div key={stat.labelKey} className={styles['statItem']}>
            <span className={styles['statValue']}>{t(stat.valueKey)}</span>
            <span className={styles['statLabel']}>{t(stat.labelKey)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
