import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { ConfirmDialog } from '@shared/ui/composed';
import {
  InventoryCreateDialog,
  InventoryEditDialog,
  StockAdjustDialog,
  MovementsHistoryPanel,
  StockTransferDialog,
} from '@features/inventory';
import type { InventoryItem } from '@entities/inventory';

interface InventoryDialogsProps {
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  editItem: InventoryItem | null;
  setEditItem: (item: InventoryItem | null) => void;
  adjustItem: InventoryItem | null;
  setAdjustItem: (item: InventoryItem | null) => void;
  transferItem: InventoryItem | null;
  setTransferItem: (item: InventoryItem | null) => void;
  historyItem: InventoryItem | null;
  setHistoryItem: (item: InventoryItem | null) => void;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  isDeleting: boolean;
  handleDelete: () => void;
}

export function InventoryDialogs({
  createOpen,
  setCreateOpen,
  editItem,
  setEditItem,
  adjustItem,
  setAdjustItem,
  transferItem,
  setTransferItem,
  historyItem,
  setHistoryItem,
  deleteId,
  setDeleteId,
  isDeleting,
  handleDelete,
}: InventoryDialogsProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  return (
    <>
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
    </>
  );
}
