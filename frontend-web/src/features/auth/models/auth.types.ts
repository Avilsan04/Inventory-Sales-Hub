export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenResponse {
  token: string;
}
