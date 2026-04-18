import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSales } from '@features/sales';
import { useTopCustomers } from '@features/analytics';
import { Skeleton, Badge, Button, Input } from '@shared/ui/primitives';
import {
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import type { BadgeVariant } from '@shared/ui/primitives';
import pageStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Sales.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function statusVariant(status: SaleStatus): BadgeVariant {
  const map: Record<SaleStatus, BadgeVariant> = {
    pending:   'warning',
    completed: 'info',
    cancelled: 'neutral',
  };
  return map[status];
}

function statusLabel(status: SaleStatus, t: (k: string) => string): string {
  const map: Record<SaleStatus, string> = {
    completed: t('sales.status.shipped'),
    pending:   t('sales.status.processing'),
    cancelled: t('sales.status.cancelled'),
  };
  return map[status];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

function shortId(id: string): string {
  const parts = id.split('-');
  if (parts.length >= 2) {
    return `${parts[0] ?? ''}-${parts[1] ?? ''}`;
  }
  return id.slice(0, 12);
}

const SKELETON_ROWS = 5;

export function SalesPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: sales, isLoading, isError } = useSales();
  const { data: topCustomers } = useTopCustomers();

  const [search, setSearch] = React.useState('');

  const customerMap = React.useMemo(() => {
    const map = new Map<string, string>();
    topCustomers?.forEach((c) => { map.set(c.customerId, c.customerName); });
    return map;
  }, [topCustomers]);

  const filtered = React.useMemo(() => {
    if (!sales) return [];
    if (!search) return sales;
    const q = search.toLowerCase();
    return sales.filter(
      (s) => s.id.toLowerCase().includes(q) || (s.customerId ?? '').toLowerCase().includes(q),
    );
  }, [sales, search]);

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
          <Button variant="outline" size="sm">{t('common.export')}</Button>
          <Button size="sm">{`+ ${t('sales.newSale')}`}</Button>
        </div>
      </header>

      <section className={pageStyles['content']}>
        <Card className={styles['tableCard']}>
          <div className={styles['controls']}>
            <div className={styles['searchBox']}>
              <Input
                type="search"
                placeholder={t('sales.searchPlaceholder')}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); }}
                aria-label={t('common.search')}
              />
            </div>
            <Button variant="outline" size="sm">{t('common.filter')}</Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton style={{ height: '1.25rem', width: '100%' }} />
                      </TableCell>
                    </TableRow>
                  ))
                : filtered.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className={pageStyles['placeholderContainer']}>
                          <p className={pageStyles['placeholder']}>{t('common.noData')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                  : filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className={styles['mono']}>{shortId(s.id)}</TableCell>
                        <TableCell>
                          {s.customerId
                            ? (customerMap.get(s.customerId) ?? shortId(s.customerId))
                            : '—'}
                        </TableCell>
                        <TableCell>{formatDate(s.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(s.status as SaleStatus)} showDot>
                            {statusLabel(s.status as SaleStatus, t)}
                          </Badge>
                        </TableCell>
                        <TableCell>{s.items.length}</TableCell>
                        <TableCell>{s.currency} {s.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
              }
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
