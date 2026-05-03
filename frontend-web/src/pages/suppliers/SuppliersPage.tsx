import * as React from 'react';
import { TruckIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSuppliers, useDeleteSupplier } from '@features/suppliers';
import { toast } from '@shared/hooks/useToast';
import { Skeleton, Button } from '@shared/ui/primitives';
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
import { SupplierCreateDialog } from '@features/suppliers/components/SupplierCreateDialog';
import { SupplierEditDialog } from '@features/suppliers/components/SupplierEditDialog';
import type { Supplier } from '@entities/supplier';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function SuppliersPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isPending, isError } = useSuppliers();
  const suppliers = data ?? [];
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editSupplier, setEditSupplier] = React.useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

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
          + Add Supplier
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
              {isPending ? (
                <Skeleton style={{ height: '2rem', width: '4rem' }} />
              ) : (
                suppliers.length
              )}
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
                          <Skeleton style={{ height: '2rem', width: '100%' }} />
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
                            label: '+ Add Supplier',
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
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
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
        title="Delete supplier?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
