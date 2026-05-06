import { create } from 'zustand';

type DialogId = 'createProduct' | 'createInventory' | 'createSale';

interface UiState {
  openDialogs: Set<DialogId>;
  openDialog: (id: DialogId) => void;
  closeDialog: (id: DialogId) => void;
  isDialogOpen: (id: DialogId) => boolean;
}

export const useUiStore = create<UiState>()((set, get) => ({
  openDialogs: new Set(),

  openDialog: (id): void => {
    set((state) => ({ openDialogs: new Set([...state.openDialogs, id]) }));
  },

  closeDialog: (id): void => {
    set((state) => {
      const next = new Set(state.openDialogs);
      next.delete(id);
      return { openDialogs: next };
    });
  },

  isDialogOpen: (id): boolean => get().openDialogs.has(id),
}));
