import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { cashSessionApi } from '../api/cashSessionApi';
import { cashSessionKeys } from './useCashSession';
import type { CashSession, OpenCashSessionDTO } from '@entities/cash-session';

export function useOpenCashSession(): UseMutationResult<CashSession, Error, OpenCashSessionDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cashSessionApi.openSession,
    onSuccess: (session) => {
      queryClient.setQueryData(cashSessionKeys.current(), session);
    },
  });
}
