import * as React from 'react';
import { TruckIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSuppliers, useDeleteSupplier } from '@features/suppliers';
import { toast } from '@shared/hooks/useToast';
import { Skeleton, Button, Pagination } from '@shared/ui/primitives';
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
  TableCell,
  ConfirmDialog,
  EmptyState,
} from '@shared/ui/composed';
import { SectionErrorBoundary } from '@app/providers';
import { SupplierCreateDialog } from '@features/suppliers';
import { SupplierEditDialog } from '@features/suppliers';
import type { Supplier } from '@entities/supplier';
import { useTableFilters } from '@shared/hooks';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

const SUPPLIER_PAGE_SIZE = 20;

export function SuppliersPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isPending, isError } = useSuppliers();
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editSupplier, setEditSupplier] = React.useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const { page, setPage, pageCount, pageSize, setPageSize, paginated } = useTableFilters<Supplier>(
    data,
    (s, q) =>
      s.name.toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q) ||
      (s.contactPerson ?? '').toLowerCase().includes(q),
    SUPPLIER_PAGE_SIZE
  );

  const suppliers = paginated;

  const handleDelete = (): void => {
    if (deleteId === null) return;
    deleteSupplier(deleteId, {
      onSuccess: () => {
        toast({ title: 'Supplier deleted' });
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
          <h1 className={styles['title']}>{t('suppliers.title')}</h1>
          <p className={styles['subtitle']}>{t('suppliers.subtitle')}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setCreateOpen(true);
          }}
        >
          {t('suppliers.addSupplier')}
        </Button>
      </header>

      <section className={styles['statsRow']} aria-label="Supplier statistics">
        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('suppliers.totalSuppliers')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}>
                <TruckIcon aria-hidden="true" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>
              {isPending ? <Skeleton className={styles['skeletonValue']} /> : suppliers.length}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={styles['content']}>
        <SectionErrorBoundary label="Suppliers">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('suppliers.name')}</TableHead>
                    <TableHead>{t('suppliers.email')}</TableHead>
                    <TableHead>{t('suppliers.phone')}</TableHead>
                    <TableHead>{t('suppliers.contactPerson')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton className={styles['skeletonRow']} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState
                          icon={<TruckIcon size={24} />}
                          title={t('suppliers.emptyTitle')}
                          description={t('suppliers.emptyDescription')}
                          action={{
                            label: t('suppliers.addSupplier'),
                            onClick: (): void => {
                              setCreateOpen(true);
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.email ?? '—'}</TableCell>
                        <TableCell>{s.phone ?? '—'}</TableCell>
                        <TableCell>{s.contactPerson ?? '—'}</TableCell>
                        <TableCell>
                          <div className={styles['cellActions']}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setEditSupplier(s);
                              }}
                            >
                              <PencilIcon size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setDeleteId(s.id);
                              }}
                            >
                              <TrashIcon size={14} />
                            </Button>
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
                  {Math.min((page - 1) * SUPPLIER_PAGE_SIZE + 1, data?.length ?? 0)}–
                  {Math.min(page * SUPPLIER_PAGE_SIZE, data?.length ?? 0)} / {data?.length ?? 0}
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

      <SupplierCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SupplierEditDialog
        supplier={editSupplier}
        open={editSupplier !== null}
        onOpenChange={(open) => {
          if (!open) setEditSupplier(null);
        }}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('suppliers.deleteSupplier')}
        description={t('common.cannotUndo')}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
