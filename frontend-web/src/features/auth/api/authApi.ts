import { z } from 'zod';
import { httpClient } from '@core/http';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenResponse,
} from '../models';

const loginResponseSchema = z.object({ token: z.string().min(1) });
const refreshResponseSchema = z.object({ token: z.string().min(1) });
const userProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  role: z.enum(['company', 'admin', 'manager', 'staff', 'customer', 'test']),
  createdAt: z.string(),
  tenantId: z.string().optional(),
});
const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  token: z.string().min(1),
});

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const data = await httpClient.post<unknown>('/auth/login', credentials);
    return loginResponseSchema.parse(data);
  },

  register: async (data: RegisterRequest): Promise<UserResponse> => {
    const response = await httpClient.post<unknown>('/auth/register', data);
    return userResponseSchema.parse(response);
  },

  logout: async (): Promise<void> => {
    await httpClient.post('/auth/logout');
  },

  getMe: async (): Promise<UserProfile> => {
    const data = await httpClient.get<unknown>('/auth/me');
    return userProfileSchema.parse(data);
  },

  refresh: async (): Promise<RefreshTokenResponse> => {
    const data = await httpClient.post<unknown>('/auth/refresh');
    return refreshResponseSchema.parse(data);
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<void> => {
    await httpClient.post('/auth/forgot-password', payload);
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await httpClient.post('/auth/reset-password', payload);
  },

  updateProfile: async (payload: UpdateProfileRequest): Promise<UserProfile> => {
    const data = await httpClient.patch<unknown>('/auth/me', payload);
    return userProfileSchema.parse(data);
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await httpClient.patch('/auth/me/password', payload);
  },
};
