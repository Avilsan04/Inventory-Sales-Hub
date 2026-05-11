import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Skeleton } from '@shared/ui/primitives';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import type { TopCustomer } from '@entities/analytics';
import styles from '@shared/styles/themes/pages/Analytics.module.scss';

interface Props {
  data: TopCustomer[] | undefined;
  isLoading: boolean;
  currency: string;
}

export function AnalyticsTopCustomersTable({
  data,
  isLoading,
  currency,
}: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.topCustomers')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('analytics.col.customer')}</TableHead>
              <TableHead>{t('analytics.col.orders')}</TableHead>
              <TableHead>{t('analytics.col.spent')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}>
                    <Skeleton className={styles['skeletonRow']} />
                  </TableCell>
                </TableRow>
              ))
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>{t('common.noData')}</TableCell>
              </TableRow>
            ) : (
              data.map((c) => (
                <TableRow key={c.customerId}>
                  <TableCell>{c.customerName}</TableCell>
                  <TableCell>{c.totalOrders}</TableCell>
                  <TableCell>
                    {currency} {c.totalSpent.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
