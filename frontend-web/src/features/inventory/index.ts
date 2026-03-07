/**
 * Inventory Feature Public API
 * Exposes ONLY hooks and types to the UI layers.
 * The raw API and internal logic are hidden.
 */

export { useInventory, inventoryKeys } from './hooks/useInventory';
export { useCreateInventoryItem } from './hooks/useCreateInventoryItem';