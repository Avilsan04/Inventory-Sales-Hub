import * as React from 'react';
import { TruckIcon, PencilIcon, TrashIcon, PlusIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSuppliers, useDeleteSupplier } from '@features/suppliers';
import { toast } from '@shared/hooks/useToast';
import { Skeleton, Button, Input, Pagination } from '@shared/ui/primitives';
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

interface SupplierRowProps {
  supplier: Supplier;
  onEdit: (s: Supplier) => void;
  onDelete: (id: string) => void;
}

function SupplierTableRow({ supplier: s, onEdit, onDelete }: SupplierRowProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  return (
    <TableRow>
      <TableCell>{s.name}</TableCell>
      <TableCell>{s.email ?? '—'}</TableCell>
      <TableCell>{s.phone ?? '—'}</TableCell>
      <TableCell>{s.contactPerson ?? '—'}</TableCell>
      <TableCell>
        <div className={styles['cellActions']}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('suppliers.editSupplier')}
            onClick={(): void => {
              onEdit(s);
            }}
          >
            <PencilIcon size={14} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('suppliers.deleteSupplier')}
            onClick={(): void => {
              onDelete(s.id);
            }}
          >
            <TrashIcon size={14} aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function SuppliersPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isPending, isError, refetch } = useSuppliers();
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editSupplier, setEditSupplier] = React.useState<Supplier | null>(null);
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
  } = useTableFilters<Supplier>(
    data,
    (s, q) =>
      s.name.toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q) ||
      (s.contactPerson ?? '').toLowerCase().includes(q),
    SUPPLIER_PAGE_SIZE
  );

  const handleDelete = (): void => {
    if (deleteId === null) return;
    deleteSupplier(deleteId, {
      onSuccess: () => {
        toast({ title: t('suppliers.toasts.deleted') });
        setDeleteId(null);
      },
      onError: (err) => {
        toast({
          title: t('common.toasts.deleteFailed'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

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

  const supplierCount = data?.length ?? 0;

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
          <PlusIcon size={14} aria-hidden="true" /> {t('suppliers.addSupplier')}
        </Button>
      </header>

      <section className={styles['statsRow']} aria-label={t('suppliers.statsAriaLabel')}>
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
              {isPending ? <Skeleton className={styles['skeletonValue']} /> : data.length}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={styles['content']}>
        <SectionErrorBoundary label="Suppliers">
          <Card>
            <CardContent>
              <div className={styles['controls']}>
                <Input
                  type="search"
                  placeholder={t('suppliers.searchPlaceholder')}
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setSearch(e.target.value);
                  }}
                  aria-label={t('suppliers.searchPlaceholder')}
                  className={styles['searchInput']}
                />
              </div>
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
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState
                          icon={<TruckIcon size={24} />}
                          title={
                            debouncedSearch
                              ? t('suppliers.noResultsTitle')
                              : t('suppliers.emptyTitle')
                          }
                          description={
                            debouncedSearch
                              ? t('suppliers.noResultsDescription')
                              : t('suppliers.emptyDescription')
                          }
                          action={
                            debouncedSearch
                              ? undefined
                              : {
                                  label: t('suppliers.addSupplier'),
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
                      <SupplierTableRow
                        key={s.id}
                        supplier={s}
                        onEdit={setEditSupplier}
                        onDelete={setDeleteId}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {pageCount > 1 && (
              <div className={styles['tableFooter']}>
                <span>
                  {Math.min((page - 1) * SUPPLIER_PAGE_SIZE + 1, supplierCount)}–
                  {Math.min(page * SUPPLIER_PAGE_SIZE, supplierCount)} / {supplierCount}
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
