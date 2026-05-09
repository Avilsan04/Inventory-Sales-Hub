import * as React from 'react';
import { PencilIcon, ShoppingCartIcon } from 'lucide-react';
import { exportToCsv } from '@shared/lib/exportCsv';
import { formatCurrency, fromCents } from '@shared/lib/formatCurrency';
import { formatOrderId } from '@shared/lib/formatters';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSalesFilters, SALES_PAGE_SIZE } from '@features/sales';
import { PermissionGuard } from '@features/auth';
import { useTopCustomers } from '@features/analytics';
import { Skeleton, Badge, Button, Input, Pagination } from '@shared/ui/primitives';
import {
  Card,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DateRangePicker,
} from '@shared/ui/composed';
import { SectionErrorBoundary } from '@app/providers';
import { SaleCreateWidget } from '@widgets';
import { SaleStatusDialog } from '@features/sales/components/SaleStatusDialog';
import { SaleDetailDrawer } from '@features/sales/components/SaleDetailDrawer';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { Sale } from '@entities/sale';
import pageStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Sales.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function statusVariant(status: SaleStatus): BadgeVariant {
  const map: Record<SaleStatus, BadgeVariant> = {
    pending: 'warning',
    completed: 'info',
    cancelled: 'neutral',
  };
  return map[status];
}

function statusLabel(status: SaleStatus, t: (k: string) => string): string {
  const map: Record<SaleStatus, string> = {
    completed: t('sales.status.shipped'),
    pending: t('sales.status.processing'),
    cancelled: t('sales.status.cancelled'),
  };
  return map[status];
}

function formatDate(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

const SKELETON_ROWS = 5;

export function SalesPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: topCustomers } = useTopCustomers();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editSale, setEditSale] = React.useState<Sale | null>(null);
  const [detailSale, setDetailSale] = React.useState<Sale | null>(null);

  const {
    data: sales,
    isLoading,
    isError,
    paginated,
    search,
    setSearch,
    debouncedSearch,
    dateFilter,
    setDateFilter,
    showDateFilter,
    toggleDateFilter,
    page,
    setPage,
    pageCount,
  } = useSalesFilters();

  const customerMap = React.useMemo(() => {
    const map = new Map<string, string>();
    topCustomers?.forEach((c) => {
      map.set(c.customerId, c.customerName);
    });
    return map;
  }, [topCustomers]);

  const handleExport = (): void => {
    exportToCsv(
      (sales ?? []).map((s) => ({
        id: formatOrderId(s.id),
        customer: s.customerId ? (customerMap.get(s.customerId) ?? s.customerId) : '',
        date: formatDate(s.createdAt),
        status: s.status,
        items: s.items.length,
        total: fromCents(s.total),
        currency: s.currency,
      })),
      'sales'
    );
  };

  if (isError) {
    return (
      <div className={pageStyles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  return (
    <div className={pageStyles['page']}>
      <header className={styles['pageHeader']}>
        <div>
          <span className={styles['eyebrow']}>{t('sales.eyebrow')}</span>
          <h1 className={styles['title']}>{t('nav.orders')}</h1>
          <p className={styles['subtitle']}>{t('sales.orderHistory')}</p>
        </div>
        <div className={styles['headerActions']}>
          <PermissionGuard permission="export:csv">
            <Button variant="outline" size="sm" onClick={handleExport}>
              {t('common.export')}
            </Button>
          </PermissionGuard>
          <Button variant="outline" size="sm" onClick={toggleDateFilter}>
            {t('common.filter')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCreateOpen(true);
            }}
          >{`+ ${t('sales.newSale')}`}</Button>
        </div>
      </header>

      {showDateFilter && (
        <div className={styles['filterRow']}>
          <span className={styles['filterLabel']}>{t('common.dateRange')}:</span>
          <DateRangePicker value={dateFilter ?? { from: '', to: '' }} onChange={setDateFilter} />
        </div>
      )}

      <section className={pageStyles['content']}>
        <SectionErrorBoundary label="Sales">
          <Card className={styles['tableCard']}>
            <div className={styles['controls']}>
              <div className={styles['searchBox']}>
                <Input
                  type="search"
                  placeholder={t('sales.searchPlaceholder')}
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearch(e.target.value);
                  }}
                  aria-label={t('common.search')}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sales.orderId')}</TableHead>
                  <TableHead>{t('sales.customer')}</TableHead>
                  <TableHead>{t('sales.date')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('sales.items')}</TableHead>
                  <TableHead>{t('sales.total')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className={styles['skeletonRow']} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        icon={<ShoppingCartIcon size={24} />}
                        title={t('sales.emptyTitle')}
                        description={t('sales.emptyDescription')}
                        action={
                          debouncedSearch
                            ? undefined
                            : {
                                label: `+ ${t('sales.newSale')}`,
                                onClick: (): void => {
                                  setCreateOpen(true);
                                },
                              }
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className={styles['mono']}>{formatOrderId(s.id)}</TableCell>
                      <TableCell>
                        {s.customerId
                          ? (customerMap.get(s.customerId) ?? `#${s.customerId.slice(0, 8)}`)
                          : '—'}
                      </TableCell>
                      <TableCell className={styles['mono']}>{formatDate(s.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(s.status)} showDot>
                          {statusLabel(s.status, t)}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.items.length}</TableCell>
                      <TableCell className={styles['mono']}>
                        {formatCurrency(s.total, s.currency)}
                      </TableCell>
                      <TableCell>
                        <div className={pageStyles['cellActions']}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t('sales.viewDetail')}
                            onClick={() => {
                              setDetailSale(s);
                            }}
                          >
                            <PencilIcon size={14} aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {pageCount > 1 && (
              <div className={pageStyles['tableFooter']}>
                <span>
                  {Math.min((page - 1) * SALES_PAGE_SIZE + 1, sales?.length ?? 0)}–
                  {Math.min(page * SALES_PAGE_SIZE, sales?.length ?? 0)} / {sales?.length ?? 0}{' '}
                  {t('nav.orders').toLowerCase()}
                </span>
                <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
              </div>
            )}
          </Card>
        </SectionErrorBoundary>
      </section>

      <SaleCreateWidget open={createOpen} onOpenChange={setCreateOpen} />
      <SaleStatusDialog
        sale={editSale}
        open={editSale !== null}
        onOpenChange={(open) => {
          if (!open) setEditSale(null);
        }}
      />
      <SaleDetailDrawer
        sale={detailSale}
        open={detailSale !== null}
        onOpenChange={(open) => {
          if (!open) setDetailSale(null);
        }}
        customerName={
          detailSale?.customerId !== undefined
            ? (customerMap.get(detailSale.customerId) ?? undefined)
            : undefined
        }
      />
    </div>
  );
}
