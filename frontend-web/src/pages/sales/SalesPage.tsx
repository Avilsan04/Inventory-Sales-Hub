import * as React from 'react';
import { TrendingUpIcon, ShoppingCartIcon, CheckCircle2Icon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSales, useSaleSummary } from '@features/sales';
import { Skeleton, Badge } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import type { BadgeVariant } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';
import statsStyles from '@shared/styles/themes/pages/Sales.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function statusVariant(status: SaleStatus): BadgeVariant {
  const map: Record<SaleStatus, BadgeVariant> = {
    pending: 'secondary',
    completed: 'success',
    cancelled: 'destructive',
  };
  return map[status];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

const SKELETON_ROWS = 5;

export function SalesPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: sales, isLoading, isError } = useSales();
  const { data: summary, isLoading: summaryLoading } = useSaleSummary();

  const statsLoaded = !isLoading && !summaryLoading;

  if (isError) {
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  const completedCount = summary?.byStatus?.find((s) => s.status === 'completed')?.count ?? 0;

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <h1 className={styles['title']}>{t('sales.title')}</h1>
        <p className={styles['subtitle']}>{t('sales.orderHistory')}</p>
      </header>

      <section className={statsStyles['statsRow']} aria-label="Sales statistics">
        <Card>
          <CardHeader>
            <CardTitle className={statsStyles['statTitle']}>{t('sales.revenue')}</CardTitle>
            <CardAction>
              <span className={statsStyles['statIcon']}><TrendingUpIcon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={statsStyles['statValue']}>
              {statsLoaded
                ? `${summary?.currency ?? ''} ${summary?.totalRevenue.toLocaleString() ?? '0'}`
                : <Skeleton style={{ height: '2rem', width: '6rem' }} />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={statsStyles['statTitle']}>{t('sales.totalOrders')}</CardTitle>
            <CardAction>
              <span className={statsStyles['statIcon']}><ShoppingCartIcon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={statsStyles['statValue']}>
              {statsLoaded
                ? (summary?.totalSales ?? 0)
                : <Skeleton style={{ height: '2rem', width: '4rem' }} />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={statsStyles['statTitle']}>{t('sales.completed')}</CardTitle>
            <CardAction>
              <span className={statsStyles['statIcon']}><CheckCircle2Icon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={statsStyles['statValue']}>
              {statsLoaded
                ? completedCount
                : <Skeleton style={{ height: '2rem', width: '4rem' }} />}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={styles['content']}>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sales.date')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('sales.items')}</TableHead>
                  <TableHead>{t('sales.total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <Skeleton style={{ height: '1.25rem', width: '100%' }} />
                        </TableCell>
                      </TableRow>
                    ))
                  : !sales || sales.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className={styles['placeholderContainer']}>
                            <p className={styles['placeholder']}>{t('common.noData')}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                    : sales.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{formatDate(s.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(s.status as SaleStatus)}>
                              {t(`sales.status.${s.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>{s.items.length}</TableCell>
                          <TableCell>{s.currency} {s.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
