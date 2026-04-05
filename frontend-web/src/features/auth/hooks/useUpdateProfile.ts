import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { authKeys } from './useAuthMe';
import type { UpdateProfileRequest, UserProfile } from '../models/auth.types';

export function useUpdateProfile(): UseMutationResult<UserProfile, Error, UpdateProfileRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<UserProfile>(authKeys.me(), updatedProfile);
    },
  });
}
