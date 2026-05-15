import * as React from 'react';
import { PencilIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useCustomers, useDeleteCustomer, useCustomerTopMap } from '@features/customers';
import { PermissionGuard } from '@features/auth';
import { useTopCustomers } from '@features/analytics';
import { exportToCsv } from '@shared/lib/exportCsv';
import { initials, formatCurrency } from '@shared/lib';
import { toast } from '@shared/hooks/useToast';
import { useTableFilters } from '@shared/hooks';
import { Skeleton, Button, Input, Avatar, AvatarFallback, Pagination } from '@shared/ui/primitives';
import {
  Card,
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
import { CustomerCreateDialog } from '@features/customers';
import { CustomerEditDialog } from '@features/customers';
import type { Customer } from '@entities/customer';
import pageStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Customers.module.scss';

const CUSTOMER_PAGE_SIZE = 20;

export function CustomersPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isPending, isError } = useCustomers();
  const { data: topCustomers } = useTopCustomers();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editCustomer, setEditCustomer] = React.useState<Customer | null>(null);
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
  } = useTableFilters<Customer>(
    data,
    (c, q) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q),
    CUSTOMER_PAGE_SIZE
  );

  const topMap = useCustomerTopMap(topCustomers);

  const handleExport = (): void => {
    exportToCsv(
      (data ?? []).map((c) => {
        const meta = topMap.get(c.id);
        return {
          name: c.name,
          email: c.email,
          phone: c.phone ?? '',
          orders: meta?.totalOrders ?? 0,
          spent: meta?.totalSpent ?? 0,
        };
      }),
      'customers'
    );
  };

  const handleDelete = (): void => {
    if (deleteId === null) return;
    deleteCustomer(deleteId, {
      onSuccess: () => {
        toast({ title: t('customers.toasts.deleted') });
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
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerText']}>
          <h1 className={styles['title']}>{t('customers.title')}</h1>
          <p className={styles['subtitle']}>{t('customers.subtitle')}</p>
        </div>
        <div className={styles['headerActions']}>
          <PermissionGuard permission="export:csv">
            <Button variant="outline" size="sm" onClick={handleExport}>
              {t('common.export')}
            </Button>
          </PermissionGuard>
          <Button
            size="sm"
            onClick={() => {
              setCreateOpen(true);
            }}
          >{`+ ${t('customers.addCustomer')}`}</Button>
        </div>
      </header>

      <SectionErrorBoundary label="Customers">
        <Card className={styles['tableCard']}>
          <div className={styles['controls']}>
            <div className={styles['searchBox']}>
              <Input
                type="search"
                placeholder={t('customers.searchPlaceholder')}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                }}
                aria-label={t('common.search')}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('customers.name')}</TableHead>
                <TableHead>{t('customers.contact')}</TableHead>
                <TableHead>{t('customers.orders')}</TableHead>
                <TableHead>{t('customers.lifetimeValue')}</TableHead>
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
                      icon={<UsersIcon size={24} />}
                      title={t('customers.emptyTitle')}
                      description={t('customers.emptyDescription')}
                      action={
                        debouncedSearch
                          ? undefined
                          : {
                              label: `+ ${t('customers.addCustomer')}`,
                              onClick: (): void => {
                                setCreateOpen(true);
                              },
                            }
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((c) => {
                  const meta = topMap.get(c.id);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className={styles['customerCell']}>
                          <Avatar>
                            <AvatarFallback>{initials(c.name)}</AvatarFallback>
                          </Avatar>
                          <span className={styles['customerName']}>{c.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className={styles['contactName']}>{c.email}</div>
                          {c.phone && <div className={styles['contactEmail']}>{c.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {meta ? (
                          <span className={styles['metaValue']}>{meta.totalOrders}</span>
                        ) : (
                          <span className={styles['metaMuted']}>—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {meta ? (
                          <span className={styles['metaValue']}>
                            {formatCurrency(meta.totalSpent, 'EUR')}
                          </span>
                        ) : (
                          <span className={styles['metaMuted']}>—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={pageStyles['cellActions']}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditCustomer(c);
                            }}
                          >
                            <PencilIcon size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setDeleteId(c.id);
                            }}
                          >
                            <TrashIcon size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {pageCount > 1 && (
            <div className={pageStyles['tableFooter']}>
              <span>
                {Math.min((page - 1) * pageSize + 1, data?.length ?? 0)}–
                {Math.min(page * pageSize, data?.length ?? 0)} / {data?.length ?? 0}
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

      <CustomerCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CustomerEditDialog
        customer={editCustomer}
        open={editCustomer !== null}
        onOpenChange={(open) => {
          if (!open) setEditCustomer(null);
        }}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('customers.deleteCustomer')}
        description={t('common.cannotUndo')}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
