import * as React from 'react';
import { PackageIcon, TagIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  useProducts,
  useCategories,
  useDeleteProduct,
  ProductCreateDialog,
  ProductEditDialog,
  ProductCsvImportDialog,
} from '@features/products';
import { toast } from '@shared/hooks/useToast';
import { PermissionGuard } from '@features/auth';
import { Skeleton, Button, Input, Pagination } from '@shared/ui';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  ConfirmDialog,
} from '@shared/ui';
import { SectionErrorBoundary } from '@app/providers';
import { useTableFilters } from '@shared/hooks';
import type { Product } from '@entities/product';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';
import { ProductTableContent } from './ProductsTable';

const PRODUCT_PAGE_SIZE = 20;

function matchesProduct(p: Product, q: string): boolean {
  return (
    p.name.toLowerCase().includes(q) ||
    p.sku.toLowerCase().includes(q) ||
    (p.category?.name ?? '').toLowerCase().includes(q)
  );
}

export function ProductsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isPending, isError, refetch } = useProducts();
  const { data: categories } = useCategories();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    pageCount,
    pageSize,
    setPageSize,
    paginated,
  } = useTableFilters<Product>(data, matchesProduct, PRODUCT_PAGE_SIZE);

  const handleDelete = (): void => {
    if (deleteId === null) return;
    deleteProduct(deleteId, {
      onSuccess: (): void => {
        toast({ title: t('products.toasts.deleted') });
        setDeleteId(null);
      },
      onError: (err): void => {
        toast({
          title: t('common.toasts.deleteFailed'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  const totalProducts = data?.length ?? 0;

  if (isError) {
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
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
          <h1 className={styles['title']}>{t('nav.products')}</h1>
          <p className={styles['subtitle']}>{t('products.subtitle')}</p>
        </div>
        <PermissionGuard permission="create:product">
          <div className={styles['headerActions']}>
            <Button
              variant="outline"
              size="sm"
              onClick={(): void => {
                setImportOpen(true);
              }}
            >
              {t('products.importCsv')}
            </Button>
            <Button
              size="sm"
              onClick={(): void => {
                setCreateOpen(true);
              }}
            >{`+ ${t('inventory.addProduct')}`}</Button>
          </div>
        </PermissionGuard>
      </header>

      <section className={styles['statsRow']} aria-label={t('products.statsAriaLabel')}>
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
              <div className={styles['controls']}>
                <Input
                  type="search"
                  placeholder={t('products.searchPlaceholder')}
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setSearch(e.target.value);
                  }}
                  aria-label={t('products.searchPlaceholder')}
                  className={styles['searchInput']}
                />
              </div>
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
                  <ProductTableContent
                    isPending={isPending}
                    paginated={paginated}
                    debouncedSearch={debouncedSearch}
                    onEdit={setEditProduct}
                    onDelete={setDeleteId}
                  />
                </TableBody>
              </Table>
            </CardContent>
            {pageCount > 1 && (
              <div className={styles['tableFooter']}>
                <span>
                  {Math.min((page - 1) * PRODUCT_PAGE_SIZE + 1, totalProducts)}–
                  {Math.min(page * PRODUCT_PAGE_SIZE, totalProducts)} / {totalProducts}
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
        onOpenChange={(open): void => {
          if (!open) setEditProduct(null);
        }}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open): void => {
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
