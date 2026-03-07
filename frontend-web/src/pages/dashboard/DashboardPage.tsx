import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@shared/styles/themes/pages/Dashboard.module.scss';

export function DashboardPage(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <h1 className={styles['title']}>{t('dashboard.title')}</h1>
        <p className={styles['subtitle']}>{t('dashboard.welcome')}</p>
      </header>

      <section className={styles['content']}>
        <div className={styles['placeholderContainer']}>
          <p className={styles['placeholder']}>{t('common.noData')}</p>
        </div>
      </section>
    </div>
  );
}