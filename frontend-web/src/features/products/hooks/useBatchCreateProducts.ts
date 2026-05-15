import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { productKeys } from './useProducts';
import type { CreateProductDTO } from '@entities/product';

const BATCH_CHUNK_SIZE = 10;

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
    const failures: BatchResult['failures'] = [];
    let successCount = 0;

    for (let chunkStart = 0; chunkStart < rows.length; chunkStart += BATCH_CHUNK_SIZE) {
      const chunk = rows.slice(chunkStart, chunkStart + BATCH_CHUNK_SIZE);
      const chunkResults = await Promise.allSettled(
        chunk.map((dto) =>
          productsApi.createProduct(dto, {
            headers: { 'Idempotency-Key': crypto.randomUUID() },
          })
        )
      );

      chunkResults.forEach((r, i) => {
        const globalIndex = chunkStart + i;
        if (r.status === 'fulfilled') {
          successCount++;
        } else {
          failures.push({
            index: globalIndex,
            name: rows[globalIndex]?.name ?? `Row ${globalIndex + 1}`,
            error: r.reason instanceof Error ? r.reason.message : 'Unknown error',
          });
        }
      });
    }

    setIsPending(false);

    if (successCount > 0) {
      void queryClient.invalidateQueries({ queryKey: productKeys.all() });
    }

    return { successCount, failureCount: failures.length, failures };
  };

  return { create, isPending };
}
