import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { httpClient } from '@core/http';
import { TIMING } from '@core/config/timing';
import { productListSchema } from '@entities/product';
import type { Product } from '@entities/product';

export const catalogKeys = {
  all: ['catalog'] as const,
  list: () => [...catalogKeys.all, 'list'] as const,
};

async function fetchCatalog(): Promise<Product[]> {
  const res = await httpClient.get<Product[]>('/products');
  return productListSchema.parse(res);
}

export function useCatalog(): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: catalogKeys.list(),
    queryFn: fetchCatalog,
    staleTime: TIMING.CATALOG_STALE_MS,
  });
}
