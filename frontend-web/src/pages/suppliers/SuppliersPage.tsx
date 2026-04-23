import * as React from 'react';
import { TruckIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSuppliers } from '@features/suppliers';
import { Spinner } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function SuppliersPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isLoading, isError } = useSuppliers();

  if (isLoading) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <h1 className={styles['title']}>{t('suppliers.title')}</h1>
        <p className={styles['subtitle']}>{t('suppliers.subtitle')}</p>
      </header>

      <section className={styles['statsRow']} aria-label="Supplier statistics">
        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('suppliers.totalSuppliers')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}><TruckIcon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>{data.length}</div>
          </CardContent>
        </Card>
      </section>

      <section className={styles['content']}>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('suppliers.name')}</TableHead>
                  <TableHead>{t('suppliers.email')}</TableHead>
                  <TableHead>{t('suppliers.phone')}</TableHead>
                  <TableHead>{t('suppliers.contactPerson')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className={styles['placeholderContainer']}>
                        <p className={styles['placeholder']}>{t('common.noData')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.email ?? '—'}</TableCell>
                      <TableCell>{s.phone ?? '—'}</TableCell>
                      <TableCell>{s.contactPerson ?? '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
