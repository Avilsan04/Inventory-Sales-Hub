import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '@features/inventory';
import { Spinner } from '@shared/ui/primitives';
import { InventoryTableWidget } from '@widgets/inventory';
import styles from '@shared/styles/themes/pages/Dashboard.module.scss';

export function DashboardPage(): React.ReactElement {
  const { t } = useTranslation();
  const { data: inventory, isLoading, isError, error } = useInventory();

  const renderContent = (): React.ReactNode => {
    if (isLoading) {
      return (
        <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
          <Spinner size="lg" />
        </div>
      );
    }

    if (isError) {
      console.error("Zod Validation or Network Error:", error);
      return (
        <div className={styles['errorContainer']} role="alert" aria-live="assertive">
          <p>{t('common.errorLoadingData', 'System failure: Unable to retrieve inventory data.')}</p>
        </div>
      );
    }

    if (!inventory || inventory.length === 0) {
      return (
        <div className={styles['placeholderContainer']}>
          <p className={styles['placeholder']}>{t('common.noData')}</p>
        </div>
      );
    }

    return <InventoryTableWidget data={inventory} />;
  };


  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <h1 className={styles['title']}>{t('dashboard.title')}</h1>
        <p className={styles['subtitle']}>{t('dashboard.welcome')}</p>
      </header>

      <section className={styles['content']}>
        {renderContent()}
      </section>
    </div>
  );
}