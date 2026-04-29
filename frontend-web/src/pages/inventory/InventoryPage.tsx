import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventory, useDeleteInventoryItem } from '@features/inventory';
import { toast } from '@shared/hooks/useToast';
import { exportToCsv } from '@shared/lib/exportCsv';
import { Spinner, Button, Pagination } from '@shared/ui/primitives';
import { Card, ConfirmDialog } from '@shared/ui/composed';
import { InventoryTableWidget } from '@widgets/inventory';
import { InventoryCreateDialog } from '@features/inventory/components/InventoryCreateDialog';
import { InventoryEditDialog } from '@features/inventory/components/InventoryEditDialog';
import { StockAdjustDialog } from '@features/inventory/components/StockAdjustDialog';
import { cn } from '@shared/lib/cn';
import { Input } from '@shared/ui/primitives';
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/pages/Inventory.module.scss';

type StockTab = 'all' | 'low' | 'out';

export function InventoryPage(): React.ReactElement {
    const { translate: t } = useTranslationAdapter();
    const { data, isLoading, isError, error } = useInventory();
    const { mutate: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();

    const [search, setSearch] = React.useState('');
    const [tab, setTab] = React.useState<StockTab>('all');
    const [page, setPage] = React.useState(1);
    const PAGE_SIZE = 10;

    const [createOpen, setCreateOpen] = React.useState(false);
    const [editItem, setEditItem] = React.useState<InventoryItem | null>(null);
    const [adjustItem, setAdjustItem] = React.useState<InventoryItem | null>(null);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    const tabs: { id: StockTab; labelKey: string; count: number }[] = React.useMemo(() => {
        const all = data ?? [];
        return [
            { id: 'all', labelKey: 'inventory.allProducts', count: all.length },
            { id: 'low', labelKey: 'inventory.lowStockTab', count: all.filter((i) => i.status === 'LOW_STOCK').length },
            { id: 'out', labelKey: 'inventory.outOfStockTab', count: all.filter((i) => i.status === 'OUT_OF_STOCK').length },
        ];
    }, [data]);

    // Reset page when filter/tab changes
    React.useEffect(() => { setPage(1); }, [tab, search]);

    const filtered: InventoryItem[] = React.useMemo(() => {
        return (data ?? []).filter((item) => {
            if (tab === 'low' && item.status !== 'LOW_STOCK') return false;
            if (tab === 'out' && item.status !== 'OUT_OF_STOCK') return false;
            if (search) {
                const q = search.toLowerCase();
                if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [data, tab, search]);

    const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleExport = (): void => {
        exportToCsv(
            (data ?? []).map((item) => ({
                sku: item.sku,
                name: item.name,
                category: item.category ?? '',
                quantity: item.quantity,
                price: item.price,
                currency: item.currency,
                status: item.status,
                reorderThreshold: item.reorderThreshold ?? '',
            })),
            'inventory',
        );
    };

    const handleDelete = (): void => {
        if (deleteId === null) return;
        deleteItem(deleteId, {
            onSuccess: () => { toast({ title: 'Item deleted' }); setDeleteId(null); },
            onError: (err) => { toast({ title: 'Delete failed', description: err.message, variant: 'destructive' }); },
        });
    };

    if (isLoading) {
        return (
            <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
                <Spinner size="lg" />
            </div>
        );
    }

    if (isError) {
        console.error('[Telemetry] Inventory fetch error:', error);
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
                    <span className={styles['eyebrow']}>CATALOG</span>
                    <h1 className={styles['title']}>{t('inventory.title')}</h1>
                    <p className={styles['subtitle']}>{t('inventory.subtitle')}</p>
                </div>
                <div className={styles['headerActions']}>
                    <Button variant="outline" size="sm" onClick={handleExport}>{t('inventory.exportCsv')}</Button>
                    <Button size="sm" onClick={() => { setCreateOpen(true); }}>{`+ ${t('inventory.addProduct')}`}</Button>
                </div>
            </header>

            <Card className={styles['tableCard']}>
                <div className={styles['controls']}>
                    <div className={styles['searchBox']}>
                        <Input
                            type="search"
                            placeholder={`${t('common.filter')} SKU, ${t('inventory.name').toLowerCase()}…`}
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); }}
                            aria-label={t('common.filter')}
                        />
                    </div>
                    <div className={styles['tabs']} role="tablist">
                        {tabs.map((tb) => (
                            <button
                                key={tb.id}
                                role="tab"
                                aria-selected={tab === tb.id}
                                onClick={() => { setTab(tb.id); }}
                                className={cn(styles['tab'], tab === tb.id && styles['tabActive'])}
                            >
                                {t(tb.labelKey)}
                                <span className={styles['tabCount']}>{tb.count}</span>
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm">{t('common.filter')}</Button>
                </div>

                {filtered.length === 0 ? (
                    <div className={styles['placeholderContainer']}>
                        <p>{t('common.noData')}</p>
                    </div>
                ) : (
                    <InventoryTableWidget
                        data={paginated}
                        onEdit={(item) => { setEditItem(item); }}
                        onAdjustStock={(item) => { setAdjustItem(item); }}
                        onDelete={(id) => { setDeleteId(id); }}
                    />
                )}

                <div className={styles['tableFooter']}>
                    <span>
                        {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} {t('inventory.products').toLowerCase()}
                    </span>
                    <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
                </div>
            </Card>

            <InventoryCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
            <InventoryEditDialog
                item={editItem}
                open={editItem !== null}
                onOpenChange={(open) => { if (!open) setEditItem(null); }}
            />
            <StockAdjustDialog
                item={adjustItem}
                open={adjustItem !== null}
                onOpenChange={(open) => { if (!open) setAdjustItem(null); }}
            />
            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => { if (!open) setDeleteId(null); }}
                title="Delete inventory item?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
                isPending={isDeleting}
            />
        </div>
    );
}
