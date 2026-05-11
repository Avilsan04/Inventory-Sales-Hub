import * as React from 'react';
import { exportToCsv } from '@shared/lib/exportCsv';
import { fromCents } from '@shared/lib';
import { formatOrderId } from '@shared/lib';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  useSalesFilters,
  SALES_PAGE_SIZE,
  SaleStatusDialog,
  SaleDetailDrawer,
} from '@features/sales';
import { PermissionGuard } from '@features/auth';
import { useTopCustomers } from '@features/analytics';
import { Button, Input, Pagination } from '@shared/ui';
import {
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  DateRangePicker,
} from '@shared/ui';
import { SectionErrorBoundary } from '@app/providers';
import { SaleCreateWidget } from '@widgets';
import type { Sale } from '@entities/sale';
import { SalesTableBody, formatDate } from './SalesTable';
import pageStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Sales.module.scss';

export function SalesPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: topCustomers } = useTopCustomers();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editSale, setEditSale] = React.useState<Sale | null>(null);
  const [detailSale, setDetailSale] = React.useState<Sale | null>(null);

  const {
    data: sales,
    isLoading,
    isFetching,
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

  const totalSales = sales?.length ?? 0;

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
            onClick={(): void => {
              setCreateOpen(true);
            }}
          >
            {`+ ${t('sales.newSale')}`}
          </Button>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setSearch(e.target.value);
                  }}
                  isLoading={isFetching}
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
                <SalesTableBody
                  isLoading={isLoading}
                  paginated={paginated}
                  debouncedSearch={debouncedSearch}
                  customerMap={customerMap}
                  t={t}
                  onDetail={setDetailSale}
                  onCreateOpen={(): void => {
                    setCreateOpen(true);
                  }}
                />
              </TableBody>
            </Table>
            {pageCount > 1 && (
              <div className={pageStyles['tableFooter']}>
                <span>
                  {Math.min((page - 1) * SALES_PAGE_SIZE + 1, totalSales)}–
                  {Math.min(page * SALES_PAGE_SIZE, totalSales)} / {totalSales}{' '}
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
        onOpenChange={(open): void => {
          if (!open) setEditSale(null);
        }}
      />
      <SaleDetailDrawer
        sale={detailSale}
        open={detailSale !== null}
        onOpenChange={(open): void => {
          if (!open) setDetailSale(null);
        }}
        customerName={
          detailSale?.customerId !== undefined ? customerMap.get(detailSale.customerId) : undefined
        }
      />
    </div>
  );
}
