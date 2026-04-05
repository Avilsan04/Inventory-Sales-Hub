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
} from '../models/auth.types';

export interface IAuthApi {
    readonly login: (credentials: LoginRequest) => Promise<LoginResponse>;
    readonly register: (payload: RegisterRequest) => Promise<UserResponse>;
    readonly logout: () => Promise<void>;
    readonly getMe: () => Promise<UserProfile>;
    readonly refresh: () => Promise<RefreshTokenResponse>;
    readonly forgotPassword: (payload: ForgotPasswordRequest) => Promise<void>;
    readonly resetPassword: (payload: ResetPasswordRequest) => Promise<void>;
    readonly updateProfile: (payload: UpdateProfileRequest) => Promise<UserProfile>;
    readonly changePassword: (payload: ChangePasswordRequest) => Promise<void>;
}