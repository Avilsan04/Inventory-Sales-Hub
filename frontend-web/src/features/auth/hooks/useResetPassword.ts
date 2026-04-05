import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { ResetPasswordRequest } from '../models/auth.types';

export function useResetPassword(): UseMutationResult<void, Error, ResetPasswordRequest> {
  return useMutation({ mutationFn: authApi.resetPassword });
}
