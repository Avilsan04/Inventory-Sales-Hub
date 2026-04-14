import * as React from 'react';
import { PackageIcon, TagIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useProducts, useCategories } from '@features/products';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

const SKELETON_ROWS = 5;

export function ProductsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isLoading, isError } = useProducts();
  const { data: categories } = useCategories();

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
        <h1 className={styles['title']}>{t('nav.products')}</h1>
        <p className={styles['subtitle']}>{t('products.subtitle')}</p>
      </header>

      <section className={styles['statsRow']} aria-label="Product statistics">
        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('products.totalProducts')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}><PackageIcon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>
              {isLoading ? <Skeleton style={{ height: '2rem', width: '4rem' }} /> : (data?.length ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('products.totalCategories')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}><TagIcon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>
              {isLoading ? <Skeleton style={{ height: '2rem', width: '4rem' }} /> : (categories?.length ?? 0)}
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
                  <TableHead>{t('inventory.productName')}</TableHead>
                  <TableHead>{t('inventory.sku')}</TableHead>
                  <TableHead>{t('inventory.price')}</TableHead>
                  <TableHead>{t('inventory.category')}</TableHead>
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
                  : !data || data.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className={styles['placeholderContainer']}>
                            <p className={styles['placeholder']}>{t('common.noData')}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                    : data.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.sku}</TableCell>
                          <TableCell>{p.currency} {p.price.toFixed(2)}</TableCell>
                          <TableCell>{p.category?.name ?? '—'}</TableCell>
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
