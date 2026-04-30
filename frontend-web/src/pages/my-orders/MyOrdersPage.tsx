import * as React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSales } from '@features/sales';
import { useAuthMe } from '@features/auth';
import { Spinner, Badge } from '@shared/ui/primitives';
import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '@shared/ui/composed';
import type { BadgeVariant } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function saleStatusVariant(status: string): BadgeVariant {
  const map: Record<SaleStatus, BadgeVariant> = {
    pending: 'warning',
    completed: 'info',
    cancelled: 'neutral',
  };
  return map[status as SaleStatus];
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
}

export function MyOrdersPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: me } = useAuthMe();
  const { data: allSales, isPending, isError } = useSales();

  const myOrders = React.useMemo(() => {
    if (!allSales || !me) return [];
    return allSales.filter((s) => s.customerId === String(me.id));
  }, [allSales, me]);

  if (isPending) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles['errorContainer']} role="alert">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div>
          <span className={styles['eyebrow']}>CUSTOMER</span>
          <h1 className={styles['title']}>{t('myOrders.title')}</h1>
          <p className={styles['subtitle']}>{t('myOrders.subtitle')}</p>
        </div>
      </header>

      <section className={styles['content']}>
        <Card>
          <CardContent>
            {myOrders.length === 0 ? (
              <EmptyState
                icon={<ShoppingCartIcon size={24} />}
                title={t('myOrders.emptyTitle')}
                description={t('myOrders.emptyDescription')}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.orderId')}</TableHead>
                    <TableHead>{t('sales.date')}</TableHead>
                    <TableHead>{t('dashboard.cols.items')}</TableHead>
                    <TableHead>{t('dashboard.cols.total')}</TableHead>
                    <TableHead>{t('dashboard.cols.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myOrders.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell style={{ fontFamily: 'monospace' }}>
                        #{s.id.startsWith('ORD-') ? s.id : s.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{new Date(s.createdAt).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{s.items.length}</TableCell>
                      <TableCell>{formatCurrency(s.total, s.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={saleStatusVariant(s.status)} showDot>
                          {t(`sales.status.${s.status}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
