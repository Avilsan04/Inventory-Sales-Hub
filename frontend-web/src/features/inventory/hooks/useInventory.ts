import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import type { InventoryItem } from '@entities/inventory';

export const inventoryKeys = {
    all: ['inventory'] as const,
    lists: () => [...inventoryKeys.all, 'list'] as const,
};

export function useInventory(): UseQueryResult<InventoryItem[]> {
    return useQuery({
        queryKey: inventoryKeys.lists(),
        queryFn: inventoryApi.getInventoryList,
    });
}