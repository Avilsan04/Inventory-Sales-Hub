import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useDeleteInventoryItem } from '@features/inventory';
import { hasPermission } from '@shared/lib/permissions';
import { toast } from '@shared/hooks/useToast';
import { exportToCsv } from '@shared/lib/exportCsv';
import { fromCents } from '@shared/lib/formatCurrency';
import type { InventoryItem } from '@entities/inventory';
import type { UserRole } from '@features/auth';

export interface InventoryPageActions {
  createOpen: boolean;
  setCreateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editItem: InventoryItem | null;
  setEditItem: React.Dispatch<React.SetStateAction<InventoryItem | null>>;
  adjustItem: InventoryItem | null;
  setAdjustItem: React.Dispatch<React.SetStateAction<InventoryItem | null>>;
  transferItem: InventoryItem | null;
  setTransferItem: React.Dispatch<React.SetStateAction<InventoryItem | null>>;
  deleteId: string | null;
  setDeleteId: React.Dispatch<React.SetStateAction<string | null>>;
  historyItem: InventoryItem | null;
  setHistoryItem: React.Dispatch<React.SetStateAction<InventoryItem | null>>;
  isDeleting: boolean;
  handleExport: (items: InventoryItem[]) => void;
  handleDelete: () => void;
  onEdit: ((item: InventoryItem) => void) | undefined;
  onAdjustStock: ((item: InventoryItem) => void) | undefined;
  onDelete: ((id: string) => void) | undefined;
  onTransfer: ((item: InventoryItem) => void) | undefined;
}

export function useInventoryPageActions(role: UserRole | undefined): InventoryPageActions {
  const { translate: t } = useTranslationAdapter();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = React.useState<InventoryItem | null>(null);
  const [transferItem, setTransferItem] = React.useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [historyItem, setHistoryItem] = React.useState<InventoryItem | null>(null);

  const handleExport = React.useCallback(
    (items: InventoryItem[]): void => {
      if (items.length === 0) {
        toast({ title: t('inventory.toasts.exportEmpty'), variant: 'destructive' });
        return;
      }
      exportToCsv(
        items.map((item) => ({
          sku: item.sku,
          name: item.name,
          category: item.category ?? '',
          quantity: item.quantity,
          price: fromCents(item.price),
          currency: item.currency,
          status: item.status,
          reorderThreshold: item.reorderThreshold,
        })),
        'inventory'
      );
    },
    [t]
  );

  const handleDelete = React.useCallback((): void => {
    if (deleteId === null) return;
    deleteItem(deleteId, {
      onSuccess: () => {
        toast({ title: t('inventory.toasts.deleted') });
        setDeleteId(null);
      },
      onError: (err) => {
        toast({
          title: t('inventory.toasts.deleteFailed'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  }, [deleteId, deleteItem, t]);

  const onEdit = hasPermission(role, 'create:inventory')
    ? (item: InventoryItem): void => {
        setEditItem(item);
      }
    : undefined;

  const onAdjustStock = hasPermission(role, 'adjust:stock')
    ? (item: InventoryItem): void => {
        setAdjustItem(item);
      }
    : undefined;

  const onDelete = hasPermission(role, 'delete:product')
    ? (id: string): void => {
        setDeleteId(id);
      }
    : undefined;

  const onTransfer = hasPermission(role, 'transfer:stock')
    ? (item: InventoryItem): void => {
        setTransferItem(item);
      }
    : undefined;

  return {
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
  };
}
