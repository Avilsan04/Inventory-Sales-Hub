import type {
  InventoryItem,
  InventoryMovement,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  StockAdjustmentDTO,
} from '@entities/inventory';

export interface IInventoryApi {
  readonly getInventoryList: () => Promise<InventoryItem[]>;
  readonly getItem: (id: string) => Promise<InventoryItem>;
  readonly getLowStock: () => Promise<InventoryItem[]>;
  readonly getMovements: () => Promise<InventoryMovement[]>;
  readonly createItem: (data: CreateInventoryItemDTO) => Promise<InventoryItem>;
  readonly updateItem: (id: string, data: UpdateInventoryItemDTO) => Promise<InventoryItem>;
  readonly adjustStock: (id: string, data: StockAdjustmentDTO) => Promise<InventoryItem>;
  readonly deleteItem: (id: string) => Promise<void>;
}
