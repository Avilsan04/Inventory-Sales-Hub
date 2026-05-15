import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventory, useInventoryFilters } from '@features/inventory';
import type { StockTab } from '@features/inventory';
import { PermissionGuard, useEffectiveRole } from '@features/auth';
import { useWarehouses } from '@features/inventory';
import { cn } from '@shared/lib/cn';
import { telemetry } from '@shared/lib/observability';
import { Button, Pagination, Input } from '@shared/ui/primitives';
import { Card, EmptyState } from '@shared/ui/composed';
import { SectionErrorBoundary } from '@app/providers';
import { InventoryTableWidget } from '@widgets/inventory';
import { AuditLogPanel } from '@widgets/audit';
import { useInventoryPageActions } from './useInventoryPageActions';
import { WarehouseFilter } from './WarehouseFilter';
import { InventoryDialogs } from './InventoryDialogs';
import styles from '@shared/styles/themes/pages/Inventory.module.scss';

export function InventoryPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const role = useEffectiveRole();
  const { data: warehouses } = useWarehouses();

  const {
    createOpen,
    setCreateOpen,
    editItem,
    setEditItem,
    adjustItem,
    setAdjustItem,
    transferItem,
    setTransferItem,
    deleteId,
    setDeleteId,
    historyItem,
    setHistoryItem,
    isDeleting,
    handleExport,
    handleDelete,
    onEdit,
    onAdjustStock,
    onDelete,
    onTransfer,
  } = useInventoryPageActions(role);

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
    pageSize,
    params,
  } = useInventoryFilters();

  const { data: inventory, isPending, isError, error, refetch } = useInventory(params);

  const inventoryItems = inventory?.data ?? [];
  const serverTotal = inventory?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(serverTotal / pageSize));

  const tabs: Array<{ id: StockTab; labelKey: string; count: number }> = React.useMemo(
    () => [
      { id: 'all', labelKey: 'inventory.allProducts', count: tab === 'all' ? serverTotal : 0 },
      { id: 'low', labelKey: 'inventory.lowStockTab', count: tab === 'low' ? serverTotal : 0 },
      { id: 'out', labelKey: 'inventory.outOfStockTab', count: tab === 'out' ? serverTotal : 0 },
    ],
    [tab, serverTotal]
  );

  React.useEffect(() => {
    if (!isError) return;
    if (error instanceof Error) {
      telemetry.captureException(error, { source: 'InventoryPage' });
    } else {
      telemetry.captureMessage('Inventory fetch error', { source: 'InventoryPage', error });
    }
  }, [isError, error]);

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
        <div className={styles['headerText']}>
          <h1 className={styles['title']}>{t('inventory.title')}</h1>
          <p className={styles['subtitle']}>{t('inventory.subtitle')}</p>
        </div>
        <div className={styles['headerActions']}>
          <WarehouseFilter
            warehouses={warehouses}
            value={warehouseFilter}
            onValueChange={setWarehouseFilter}
            placeholder={t('inventory.filterByWarehouse')}
            allLabel={t('inventory.allWarehouses')}
          />
          <PermissionGuard permission="export:csv">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleExport(inventoryItems);
              }}
            >
              {t('inventory.exportCsv')}
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="create:inventory">
            <Button
              size="sm"
              onClick={() => {
                setCreateOpen(true);
              }}
            >
              {`+ ${t('inventory.addProduct')}`}
            </Button>
          </PermissionGuard>
        </div>
      </header>

      <Card noPadding className={styles['tableCard']}>
        <div className={styles['controls']}>
          <div className={styles['searchBox']}>
            <Input
              type="search"
              placeholder={t('inventory.searchPlaceholder')}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
              }}
              aria-label={t('inventory.searchPlaceholder')}
            />
          </div>
          <div className={styles['tabs']} role="tablist">
            {tabs.map((tb) => (
              <Button
                key={tb.id}
                id={`inventory-tab-${tb.id}`}
                role="tab"
                aria-selected={tab === tb.id}
                aria-controls="inventory-tabpanel"
                onClick={() => {
                  setTab(tb.id);
                }}
                variant="ghost"
                className={cn(styles['tab'], tab === tb.id && styles['tabActive'])}
              >
                {t(tb.labelKey)}
                <span className={styles['tabCount']}>{tb.count}</span>
              </Button>
            ))}
          </div>
        </div>

        <div id="inventory-tabpanel" role="tabpanel" aria-labelledby={`inventory-tab-${tab}`}>
          <SectionErrorBoundary label="Inventory">
            {!isPending && inventoryItems.length === 0 ? (
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
                data={inventoryItems}
                isPending={isPending}
                onEdit={onEdit}
                onAdjustStock={onAdjustStock}
                onDelete={onDelete}
                onViewHistory={(item) => {
                  setHistoryItem(item);
                }}
                onTransfer={onTransfer}
              />
            )}
          </SectionErrorBoundary>
        </div>

        <div className={styles['tableFooter']}>
          <span>
            {serverTotal > 0
              ? `${Math.min((page - 1) * pageSize + 1, serverTotal)}–${Math.min(page * pageSize, serverTotal)}`
              : '0–0'}{' '}
            / {serverTotal} {t('inventory.products').toLowerCase()}
          </span>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </Card>

      <PermissionGuard permission="view:audit">
        <Card noPadding className={cn(styles['tableCard'], styles['auditCard'])}>
          <div className={styles['auditCardHeader']}>
            <h3 className={styles['auditTitle']}>{t('common.auditLog')}</h3>
          </div>
          <div className={styles['auditCardBody']}>
            <AuditLogPanel entityType="inventory" />
          </div>
        </Card>
      </PermissionGuard>

      <InventoryDialogs
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        editItem={editItem}
        setEditItem={setEditItem}
        adjustItem={adjustItem}
        setAdjustItem={setAdjustItem}
        transferItem={transferItem}
        setTransferItem={setTransferItem}
        historyItem={historyItem}
        setHistoryItem={setHistoryItem}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        isDeleting={isDeleting}
        handleDelete={handleDelete}
      />
    </div>
  );
}
