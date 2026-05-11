import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { CreateProductDTO } from '@entities/product';

export interface BatchResult {
  successCount: number;
  failureCount: number;
  failures: Array<{ index: number; name: string; error: string }>;
}

export function useBatchCreateProducts(): {
  create: (rows: CreateProductDTO[]) => Promise<BatchResult>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const create = async (rows: CreateProductDTO[]): Promise<BatchResult> => {
    setIsPending(true);
    const results = await Promise.allSettled(rows.map((dto) => productsApi.createProduct(dto)));
    setIsPending(false);

    const failures: BatchResult['failures'] = [];
    let successCount = 0;

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        successCount++;
      } else {
        failures.push({
          index: i,
          name: rows[i]?.name ?? `Row ${i + 1}`,
          error: r.reason instanceof Error ? r.reason.message : 'Unknown error',
        });
      }
    });

    if (successCount > 0) {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    }

    return { successCount, failureCount: failures.length, failures };
  };

  return { create, isPending };
}
