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

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> =>
    httpClient.post<LoginResponse>('/auth/login', credentials),

  register: async (data: RegisterRequest): Promise<UserResponse> =>
    httpClient.post<UserResponse>('/auth/register', data),

  logout: async (): Promise<void> => {
    await httpClient.post<unknown>('/auth/logout');
  },

  getMe: async (): Promise<UserProfile> =>
    httpClient.get<UserProfile>('/auth/me'),

  refresh: async (): Promise<RefreshTokenResponse> =>
    httpClient.post<RefreshTokenResponse>('/auth/refresh'),

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<void> => {
    await httpClient.post<unknown>('/auth/forgot-password', payload);
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await httpClient.post<unknown>('/auth/reset-password', payload);
  },

  updateProfile: async (payload: UpdateProfileRequest): Promise<UserProfile> =>
    httpClient.patch<UserProfile>('/auth/me', payload),

  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await httpClient.patch<unknown>('/auth/me/password', payload);
  },
};