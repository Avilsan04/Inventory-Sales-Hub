import * as React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useMyOrders } from '@features/sales';
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
import { useFormatCurrency } from '@shared/lib/formatCurrency';
import { cn } from '@shared/lib/cn';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { Sale, SaleStatus } from '@entities/sale';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';
import tableStyles from '@shared/styles/themes/pages/Sales.module.scss';

type StatusFilter = 'all' | SaleStatus;

const STATUS_BADGE: Record<SaleStatus, BadgeVariant> = {
  pending: 'warning',
  completed: 'success',
  cancelled: 'neutral',
};

function orderId(id: string): string {
  return id.startsWith('ORD-') ? `#${id}` : `#${id.slice(0, 8)}`;
}

function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
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
  const fmt = useFormatCurrency();
  const { data: myOrders, isLoading, isError, refetch } = useMyOrders();

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [detailSale, setDetailSale] = React.useState<Sale | null>(null);

  const filtered = React.useMemo(() => {
    if (!myOrders) return [];
    if (statusFilter === 'all') return myOrders;
    return myOrders.filter((s) => s.status === statusFilter);
  }, [myOrders, statusFilter]);

  if (isError) {
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void refetch();
          }}
        >
          {t('common.retry')}
        </Button>
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
              ) : filtered.length === 0 ? (
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
                filtered.map((s) => (
                  <TableRow
                    key={s.id}
                    tabIndex={0}
                    onClick={() => {
                      setDetailSale(s);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDetailSale(s);
                      }
                    }}
                    className={cn(tableStyles['mono'], tableStyles['clickableRow'])}
                  >
                    <TableCell className={tableStyles['mono']}>{orderId(s.id)}</TableCell>
                    <TableCell>{formatOrderDate(s.createdAt)}</TableCell>
                    <TableCell>{s.items.length}</TableCell>
                    <TableCell className={tableStyles['mono']}>{fmt(s.total)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[s.status]} showDot>
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
