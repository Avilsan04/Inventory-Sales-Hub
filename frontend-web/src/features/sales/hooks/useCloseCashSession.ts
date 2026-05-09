import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { cashSessionApi } from '../api/cashSessionApi';
import { cashSessionKeys } from './useCashSession';
import type { CashSession, CloseCashSessionDTO } from '@entities/cash-session';

export function useCloseCashSession(
  sessionId: string
): UseMutationResult<CashSession, Error, CloseCashSessionDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto) => cashSessionApi.closeSession({ id: sessionId, dto }),
    onSuccess: () => {
      queryClient.setQueryData(cashSessionKeys.current(), null);
    },
  });
}
