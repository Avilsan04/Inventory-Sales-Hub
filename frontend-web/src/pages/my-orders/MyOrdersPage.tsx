import * as React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSales } from '@features/sales';
import { useAuthMe } from '@features/auth';
import { SaleDetailDrawer } from '@features/sales';
import { Skeleton, Badge, Button } from '@shared/ui/primitives';
import {
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '@shared/ui/composed';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { cn } from '@shared/lib/cn';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { Sale } from '@entities/sale';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';
import tableStyles from '@shared/styles/themes/pages/Sales.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';
type StatusFilter = 'all' | SaleStatus;

function statusVariant(status: SaleStatus): BadgeVariant {
  const map: Record<SaleStatus, BadgeVariant> = {
    pending: 'warning',
    completed: 'info',
    cancelled: 'neutral',
  };
  return map[status];
}

function orderId(id: string): string {
  return id.startsWith('ORD-') ? `#${id}` : `#${id.slice(0, 8)}`;
}

const SKELETON_ROWS = 4;

const STATUS_FILTERS: Array<{ id: StatusFilter; labelKey: string }> = [
  { id: 'all', labelKey: 'common.all' },
  { id: 'pending', labelKey: 'sales.status.processing' },
  { id: 'completed', labelKey: 'sales.status.shipped' },
  { id: 'cancelled', labelKey: 'sales.status.cancelled' },
];

export function MyOrdersPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: me } = useAuthMe();
  const { data: allSales, isLoading, isError } = useSales();

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [detailSale, setDetailSale] = React.useState<Sale | null>(null);

  const myOrders = React.useMemo(() => {
    if (!allSales || !me) return [];
    const owned = allSales.filter((s) => s.customerId === String(me.id));
    if (statusFilter === 'all') return owned;
    return owned.filter((s) => s.status === statusFilter);
  }, [allSales, me, statusFilter]);

  if (isError) {
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div>
          <h1 className={styles['title']}>{t('myOrders.title')}</h1>
          <p className={styles['subtitle']}>{t('myOrders.subtitle')}</p>
        </div>
      </header>

      <section className={styles['content']}>
        <Card className={tableStyles['tableCard']}>
          <div className={tableStyles['controls']}>
            <div className={tableStyles['filterPills']}>
              {STATUS_FILTERS.map(({ id, labelKey }) => (
                <Button
                  key={id}
                  size="sm"
                  variant={statusFilter === id ? 'default' : 'outline'}
                  onClick={() => {
                    setStatusFilter(id);
                  }}
                >
                  {t(labelKey)}
                </Button>
              ))}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('sales.orderId')}</TableHead>
                <TableHead>{t('sales.date')}</TableHead>
                <TableHead>{t('sales.items')}</TableHead>
                <TableHead>{t('sales.total')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className={tableStyles['skeletonRow']} />
                    </TableCell>
                  </TableRow>
                ))
              ) : myOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={<ShoppingCartIcon size={24} />}
                      title={t('myOrders.emptyTitle')}
                      description={t('myOrders.emptyDescription')}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                myOrders.map((s) => (
                  <TableRow
                    key={s.id}
                    onClick={() => {
                      setDetailSale(s);
                    }}
                    className={cn(tableStyles['mono'], tableStyles['clickableRow'])}
                  >
                    <TableCell className={tableStyles['mono']}>{orderId(s.id)}</TableCell>
                    <TableCell>{s.createdAt.slice(0, 10)}</TableCell>
                    <TableCell>{s.items.length}</TableCell>
                    <TableCell className={tableStyles['mono']}>
                      {formatCurrency(s.total, s.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(s.status)} showDot>
                        {t(`sales.status.${s.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </section>

      <SaleDetailDrawer
        sale={detailSale}
        open={detailSale !== null}
        onOpenChange={(open) => {
          if (!open) setDetailSale(null);
        }}
      />
    </div>
  );
}
