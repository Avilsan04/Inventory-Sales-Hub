import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { salesApi } from '../api/salesApi';
import { saleKeys } from './useSales';
import type { Sale, UpdateSaleStatusDTO } from '@entities/sale';

interface UpdateStatusContext {
  previousList: Sale[] | undefined;
  previousDetail: Sale | undefined;
}

export function useUpdateSaleStatus(
  id: string
): UseMutationResult<Sale, Error, UpdateSaleStatusDTO, UpdateStatusContext> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => salesApi.updateStatus(id, data),
    onMutate: async (data): Promise<UpdateStatusContext> => {
      await queryClient.cancelQueries({ queryKey: saleKeys.lists() });
      await queryClient.cancelQueries({ queryKey: saleKeys.detail(id) });
      const previousList = queryClient.getQueryData<Sale[]>(saleKeys.lists());
      const previousDetail = queryClient.getQueryData<Sale>(saleKeys.detail(id));
      queryClient.setQueryData<Sale[]>(
        saleKeys.lists(),
        (old) => old?.map((s) => (s.id === id ? { ...s, status: data.status } : s)) ?? []
      );
      queryClient.setQueryData<Sale>(saleKeys.detail(id), (old) =>
        old !== undefined ? { ...old, status: data.status } : undefined
      );
      return { previousList, previousDetail };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(saleKeys.lists(), context.previousList);
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(saleKeys.detail(id), context.previousDetail);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: saleKeys.summary() });
    },
  });
}
