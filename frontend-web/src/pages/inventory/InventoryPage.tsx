import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventory, useDeleteInventoryItem } from '@features/inventory';
import { useInventoryFilters, PAGE_SIZE } from '@features/inventory/hooks/useInventoryFilters';
import { PermissionGuard, useEffectiveRole } from '@features/auth';
import { hasPermission } from '@shared/lib/permissions';
import { toast } from '@shared/hooks/useToast';
import { exportToCsv } from '@shared/lib/exportCsv';
import { fromCents } from '@shared/lib/formatCurrency';
import { Button, Pagination, Input } from '@shared/ui/primitives';
import { Card, ConfirmDialog, EmptyState } from '@shared/ui/composed';
import { SectionErrorBoundary } from '@app/providers';
import { InventoryTableWidget } from '@widgets/inventory';
import { AuditLogPanel } from '@widgets/audit';
import { InventoryCreateDialog } from '@features/inventory/components/InventoryCreateDialog';
import { InventoryEditDialog } from '@features/inventory/components/InventoryEditDialog';
import { StockAdjustDialog } from '@features/inventory/components/StockAdjustDialog';
import { MovementsHistoryPanel } from '@features/inventory/components/MovementsHistoryPanel';
import { StockTransferDialog } from '@features/inventory/components/StockTransferDialog';
import { useWarehouses } from '@features/inventory/hooks/useWarehouses';
import { cn } from '@shared/lib/cn';
import { telemetry } from '@shared/lib/observability';
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/pages/Inventory.module.scss';

export function InventoryPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isPending, isError, error } = useInventory();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();
  const role = useEffectiveRole();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = React.useState<InventoryItem | null>(null);
  const [transferItem, setTransferItem] = React.useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [historyItem, setHistoryItem] = React.useState<InventoryItem | null>(null);

  const { data: warehouses } = useWarehouses();

  const {
    search,
    setSearch,
    tab,
    setTab,
    page,
    setPage,
    warehouseFilter,
    setWarehouseFilter,
    debouncedSearch,
    tabs,
    filtered,
    paginated,
    pageCount,
  } = useInventoryFilters(data);

  const handleExport = (): void => {
    exportToCsv(
      (data ?? []).map((item) => ({
        sku: item.sku,
        name: item.name,
        category: item.category ?? '',
        quantity: item.quantity,
        price: fromCents(item.price),
        currency: item.currency,
        status: item.status,
        reorderThreshold: item.reorderThreshold ?? '',
      })),
      'inventory'
    );
  };

  const handleDelete = (): void => {
    if (deleteId === null) return;
    deleteItem(deleteId, {
      onSuccess: () => {
        toast({ title: 'Item deleted' });
        setDeleteId(null);
      },
      onError: (err) => {
        toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
      },
    });
  };

  if (isError) {
    if (error instanceof Error) {
      telemetry.captureException(error, { source: 'InventoryPage' });
    } else {
      telemetry.captureMessage('Inventory fetch error', { source: 'InventoryPage', error });
    }
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
          <h1 className={styles['title']}>{t('inventory.title')}</h1>
          <p className={styles['subtitle']}>{t('inventory.subtitle')}</p>
        </div>
        <div className={styles['headerActions']}>
          {warehouses && warehouses.length > 0 && (
            <select
              value={warehouseFilter ?? ''}
              onChange={(e) => {
                setWarehouseFilter(e.target.value !== '' ? e.target.value : null);
              }}
              className={styles['nativeSelect']}
              aria-label={t('inventory.filterByWarehouse')}
            >
              <option value="">{t('inventory.allWarehouses')}</option>
              {warehouses
                .filter((w) => w.isActive)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          )}
          <PermissionGuard permission="export:csv">
            <Button variant="outline" size="sm" onClick={handleExport}>
              {t('inventory.exportCsv')}
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="transfer:stock">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTransferItem(paginated[0] ?? null);
              }}
              disabled={paginated.length === 0}
            >
              {t('inventory.transferStock')}
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="create:inventory">
            <Button
              size="sm"
              onClick={() => {
                setCreateOpen(true);
              }}
            >{`+ ${t('inventory.addProduct')}`}</Button>
          </PermissionGuard>
        </div>
      </header>

      <Card className={styles['tableCard']}>
        <div className={styles['controls']}>
          <div className={styles['searchBox']}>
            <Input
              type="search"
              placeholder={`${t('common.filter')} SKU, ${t('inventory.name').toLowerCase()}…`}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
              }}
              aria-label={t('common.filter')}
            />
          </div>
          <div className={styles['tabs']} role="tablist">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                role="tab"
                aria-selected={tab === tb.id}
                onClick={() => {
                  setTab(tb.id);
                }}
                className={cn(styles['tab'], tab === tb.id && styles['tabActive'])}
              >
                {t(tb.labelKey)}
                <span className={styles['tabCount']}>{tb.count}</span>
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            {t('common.filter')}
          </Button>
        </div>

        <SectionErrorBoundary label="Inventory">
          {!isPending && filtered.length === 0 ? (
            <EmptyState
              icon={<PackageIcon size={24} />}
              title={t('inventory.emptyTitle')}
              description={t('inventory.emptyDescription')}
              action={
                debouncedSearch
                  ? undefined
                  : {
                      label: `+ ${t('inventory.addProduct')}`,
                      onClick: (): void => {
                        setCreateOpen(true);
                      },
                    }
              }
            />
          ) : (
            <InventoryTableWidget
              data={paginated}
              isPending={isPending}
              onEdit={
                hasPermission(role, 'create:inventory')
                  ? (item): void => {
                      setEditItem(item);
                    }
                  : undefined
              }
              onAdjustStock={
                hasPermission(role, 'adjust:stock')
                  ? (item): void => {
                      setAdjustItem(item);
                    }
                  : undefined
              }
              onDelete={
                hasPermission(role, 'delete:product')
                  ? (id): void => {
                      setDeleteId(id);
                    }
                  : undefined
              }
              onViewHistory={(item) => {
                setHistoryItem(item);
              }}
            />
          )}
        </SectionErrorBoundary>

        <div className={styles['tableFooter']}>
          <span>
            {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}{' '}
            {t('inventory.products').toLowerCase()}
          </span>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </Card>

      <PermissionGuard permission="view:audit">
        <Card className={`${styles['tableCard']} ${styles['auditCard']}`}>
          <div className={styles['auditCardHeader']}>
            <h3 className={styles['auditTitle']}>{t('common.auditLog')}</h3>
          </div>
          <div className={styles['auditCardBody']}>
            <AuditLogPanel entityType="inventory" />
          </div>
        </Card>
      </PermissionGuard>

      <MovementsHistoryPanel
        item={historyItem}
        open={historyItem !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryItem(null);
        }}
      />
      <InventoryCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <InventoryEditDialog
        item={editItem}
        open={editItem !== null}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      />
      <StockAdjustDialog
        item={adjustItem}
        open={adjustItem !== null}
        onOpenChange={(open) => {
          if (!open) setAdjustItem(null);
        }}
      />
      <StockTransferDialog
        item={transferItem}
        open={transferItem !== null}
        onOpenChange={(open) => {
          if (!open) setTransferItem(null);
        }}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('inventory.deleteItem')}
        description={t('common.cannotUndo')}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
