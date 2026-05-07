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
import type { TopProduct } from '@entities/analytics';
import styles from '@shared/styles/themes/pages/Analytics.module.scss';

interface Props {
  data: TopProduct[] | undefined;
  isLoading: boolean;
  currency: string;
}

export function AnalyticsTopProductsTable({
  data,
  isLoading,
  currency,
}: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('analytics.topProducts')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('analytics.col.product')}</TableHead>
              <TableHead>{t('analytics.col.sku')}</TableHead>
              <TableHead>{t('analytics.col.sold')}</TableHead>
              <TableHead>{t('analytics.col.revenue')}</TableHead>
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
              data.map((p) => (
                <TableRow key={p.productId}>
                  <TableCell>{p.productName}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.totalSold}</TableCell>
                  <TableCell>
                    {currency} {p.revenue.toLocaleString()}
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
