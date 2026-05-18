export type {
  InventoryItem,
  InventoryFilters,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  StockAdjustmentDTO,
  InventoryMovement,
} from './models/inventory.types';

export {
  inventoryItemSchema,
  inventoryListSchema,
  paginatedInventorySchema,
  createInventoryItemSchema,
  updateInventoryItemSchema,
  stockAdjustmentSchema,
  inventoryMovementSchema,
  inventoryMovementListSchema,
} from './models/inventory.schema';

export type { PaginatedInventoryResponse } from './models/inventory.schema';
export { useLowStockList } from './hooks/useLowStockList';
