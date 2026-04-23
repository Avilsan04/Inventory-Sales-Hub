import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { ForgotPasswordRequest } from '../models/auth.types';

export function useForgotPassword(): UseMutationResult<void, Error, ForgotPasswordRequest> {
  return useMutation({ mutationFn: authApi.forgotPassword });
}
