import * as React from 'react';
import { PackageIcon, TagIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useProducts, useCategories, useDeleteProduct } from '@features/products';
import { PermissionGuard } from '@features/auth';
import { toast } from '@shared/hooks/useToast';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton, Button, Pagination } from '@shared/ui/primitives';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ConfirmDialog,
} from '@shared/ui/composed';
import { SectionErrorBoundary } from '@app/providers';
import { ProductCreateDialog } from '@features/products/components/ProductCreateDialog';
import { ProductEditDialog } from '@features/products/components/ProductEditDialog';
import { ProductCsvImportDialog } from '@features/products/components/ProductCsvImportDialog';
import { useTableFilters } from '@shared/hooks';
import type { Product } from '@entities/product';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

const PRODUCT_PAGE_SIZE = 20;

const SKELETON_ROWS = 5;

export function ProductsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isPending, isError } = useProducts();
  const { data: categories } = useCategories();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const { page, setPage, pageCount, pageSize, setPageSize, paginated } = useTableFilters<Product>(
    data,
    (p, q) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category?.name ?? '').toLowerCase().includes(q),
    PRODUCT_PAGE_SIZE
  );

  const handleDelete = (): void => {
    if (deleteId === null) return;
    deleteProduct(deleteId, {
      onSuccess: () => {
        toast({ title: 'Product deleted' });
        setDeleteId(null);
      },
      onError: (err) => {
        toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
      },
    });
  };

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
          <h1 className={styles['title']}>{t('nav.products')}</h1>
          <p className={styles['subtitle']}>{t('products.subtitle')}</p>
        </div>
        <PermissionGuard permission="create:product">
          <div className={styles['headerActions']}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImportOpen(true);
              }}
            >
              {t('products.importCsv')}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setCreateOpen(true);
              }}
            >
              {`+ ${t('inventory.addProduct')}`}
            </Button>
          </div>
        </PermissionGuard>
      </header>

      <section className={styles['statsRow']} aria-label="Product statistics">
        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('products.totalProducts')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}>
                <PackageIcon aria-hidden="true" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>
              {isPending ? <Skeleton className={styles['skeletonValue']} /> : data.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('products.totalCategories')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}>
                <TagIcon aria-hidden="true" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>
              {isPending ? (
                <Skeleton className={styles['skeletonValue']} />
              ) : (
                (categories?.length ?? 0)
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={styles['content']}>
        <SectionErrorBoundary label="Products">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.productName')}</TableHead>
                    <TableHead>{t('inventory.sku')}</TableHead>
                    <TableHead>{t('inventory.price')}</TableHead>
                    <TableHead>{t('inventory.category')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton className={styles['skeletonRow']} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState icon={<PackageIcon size={24} />} title={t('common.noData')} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.sku}</TableCell>
                        <TableCell>{formatCurrency(p.price, p.currency)}</TableCell>
                        <TableCell>{p.category?.name ?? '—'}</TableCell>
                        <TableCell>
                          <div className={styles['cellActions']}>
                            <PermissionGuard permission="create:product">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Editar producto"
                                onClick={() => {
                                  setEditProduct(p);
                                }}
                              >
                                <PencilIcon size={14} aria-hidden="true" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permission="delete:product">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Eliminar producto"
                                onClick={() => {
                                  setDeleteId(p.id);
                                }}
                              >
                                <TrashIcon size={14} aria-hidden="true" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {pageCount > 1 && (
              <div className={styles['tableFooter']}>
                <span>
                  {Math.min((page - 1) * PRODUCT_PAGE_SIZE + 1, data?.length ?? 0)}–
                  {Math.min(page * PRODUCT_PAGE_SIZE, data?.length ?? 0)} / {data?.length ?? 0}
                </span>
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onPageChange={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </Card>
        </SectionErrorBoundary>
      </section>

      <ProductCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ProductCsvImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <ProductEditDialog
        product={editProduct}
        open={editProduct !== null}
        onOpenChange={(open) => {
          if (!open) setEditProduct(null);
        }}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('products.deleteProduct')}
        description={t('common.cannotUndo')}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
