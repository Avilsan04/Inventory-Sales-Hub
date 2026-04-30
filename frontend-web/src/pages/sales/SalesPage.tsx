import * as React from 'react';
import { PencilIcon, ShoppingCartIcon } from 'lucide-react';
import { exportToCsv } from '@shared/lib/exportCsv';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSales } from '@features/sales';
import { useTopCustomers } from '@features/analytics';
import { useDebounce } from '@shared/hooks';
import { Skeleton, Badge, Button, Input } from '@shared/ui/primitives';
import {
  Card,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import { SectionErrorBoundary } from '@app/providers';
import { SaleCreateDialog } from '@features/sales/components/SaleCreateDialog';
import { SaleStatusDialog } from '@features/sales/components/SaleStatusDialog';
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

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function orderId(id: string): string {
  return id.startsWith('ORD-') ? `#${id}` : `#${id.slice(0, 8)}`;
}

const SKELETON_ROWS = 5;

export function SalesPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: sales, isLoading, isError } = useSales();
  const { data: topCustomers } = useTopCustomers();

  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search);
  const [createOpen, setCreateOpen] = React.useState(false);

  const handleExport = (): void => {
    exportToCsv(
      (sales ?? []).map((s) => ({
        id: orderId(s.id),
        customer: s.customerId ? (customerMap.get(s.customerId) ?? s.customerId) : '',
        date: formatDate(s.createdAt),
        status: s.status,
        items: s.items.length,
        total: s.total,
        currency: s.currency,
      })),
      'sales'
    );
  };
  const [editSale, setEditSale] = React.useState<Sale | null>(null);

  const customerMap = React.useMemo(() => {
    const map = new Map<string, string>();
    topCustomers?.forEach((c) => {
      map.set(c.customerId, c.customerName);
    });
    return map;
  }, [topCustomers]);

  const filtered = React.useMemo(() => {
    if (!sales) return [];
    if (!debouncedSearch) return sales;
    const q = debouncedSearch.toLowerCase();
    return sales.filter(
      (s) => s.id.toLowerCase().includes(q) || (s.customerId ?? '').toLowerCase().includes(q)
    );
  }, [sales, debouncedSearch]);

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
          <span className={styles['eyebrow']}>SALES</span>
          <h1 className={styles['title']}>{t('nav.orders')}</h1>
          <p className={styles['subtitle']}>{t('sales.orderHistory')}</p>
        </div>
        <div className={styles['headerActions']}>
          <Button variant="outline" size="sm" onClick={handleExport}>
            {t('common.export')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCreateOpen(true);
            }}
          >{`+ ${t('sales.newSale')}`}</Button>
        </div>
      </header>

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
              <Button variant="outline" size="sm">
                {t('common.filter')}
              </Button>
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
                ) : filtered.length === 0 ? (
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
                  filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className={styles['mono']}>{orderId(s.id)}</TableCell>
                      <TableCell>
                        {s.customerId
                          ? (customerMap.get(s.customerId) ?? `#${s.customerId.slice(0, 8)}`)
                          : '—'}
                      </TableCell>
                      <TableCell className={styles['mono']}>{formatDate(s.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(s.status as SaleStatus)} showDot>
                          {statusLabel(s.status as SaleStatus, t)}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.items.length}</TableCell>
                      <TableCell className={styles['mono']}>
                        {formatCurrency(s.total, s.currency)}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditSale(s);
                            }}
                          >
                            <PencilIcon size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </SectionErrorBoundary>
      </section>

      <SaleCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SaleStatusDialog
        sale={editSale}
        open={editSale !== null}
        onOpenChange={(open) => {
          if (!open) setEditSale(null);
        }}
      />
    </div>
  );
}
