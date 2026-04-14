import * as React from 'react';
import { UsersIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useCustomers } from '@features/customers';
import { Spinner } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function CustomersPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isLoading, isError } = useCustomers();

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
        <h1 className={styles['title']}>{t('customers.title')}</h1>
        <p className={styles['subtitle']}>{t('customers.subtitle')}</p>
      </header>

      <section className={styles['statsRow']} aria-label="Customer statistics">
        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('customers.totalCustomers')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}><UsersIcon aria-hidden="true" /></span>
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
                  <TableHead>{t('customers.name')}</TableHead>
                  <TableHead>{t('customers.email')}</TableHead>
                  <TableHead>{t('customers.phone')}</TableHead>
                  <TableHead>{t('customers.address')}</TableHead>
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
                  data.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone ?? '—'}</TableCell>
                      <TableCell>
                        {c.address
                          ? c.address.length > 35
                            ? `${c.address.slice(0, 35)}…`
                            : c.address
                          : '—'}
                      </TableCell>
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
