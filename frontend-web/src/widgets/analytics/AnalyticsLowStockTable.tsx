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
import type { LowStockAlert } from '@entities/analytics';
import styles from '@shared/styles/themes/pages/Analytics.module.scss';

interface Props {
  data: LowStockAlert[] | undefined;
  isLoading: boolean;
}

export function AnalyticsLowStockTable({ data, isLoading }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.lowStockAlerts')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('analytics.col.item')}</TableHead>
              <TableHead>{t('analytics.col.sku')}</TableHead>
              <TableHead>{t('analytics.col.qty')}</TableHead>
              <TableHead>{t('analytics.col.threshold')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className={styles['skeletonRow']} />
                  </TableCell>
                </TableRow>
              ))
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>{t('common.noData')}</TableCell>
              </TableRow>
            ) : (
              data.map((a) => (
                <TableRow key={a.itemId}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.sku}</TableCell>
                  <TableCell>{a.currentQuantity}</TableCell>
                  <TableCell>{a.threshold}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
