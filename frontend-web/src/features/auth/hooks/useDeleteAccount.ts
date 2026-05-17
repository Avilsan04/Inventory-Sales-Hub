import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { authApi } from '../api';

export function useDeleteAccount(): UseMutationResult<void, Error, void> {
  return useMutation({ mutationFn: () => authApi.deleteAccount() });
}
