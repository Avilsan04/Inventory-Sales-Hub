import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { ChangePasswordRequest } from '../models/auth.types';

export function useChangePassword(): UseMutationResult<void, Error, ChangePasswordRequest> {
  return useMutation({ mutationFn: authApi.changePassword });
}
