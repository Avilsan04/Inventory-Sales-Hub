import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import type { InventoryItem } from '@entities/inventory';

// Strict Query Key Factory to prevent cache collisions
export const inventoryKeys = {
    all: ['inventory'] as const,
    lists: () => [...inventoryKeys.all, 'list'] as const,
    list: (filters: string) => [...inventoryKeys.lists(), { filters }] as const,
    details: () => [...inventoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.details(), id] as const,
};

export function useInventory(): UseQueryResult<InventoryItem[]> {
    return useQuery({
        queryKey: inventoryKeys.lists(),
        queryFn: inventoryApi.getInventoryList,
    });
}