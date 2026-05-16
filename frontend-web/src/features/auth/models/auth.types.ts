export type UserRole = 'company' | 'admin' | 'manager' | 'staff' | 'customer' | 'test';

export type RegisterRole = Extract<UserRole, 'customer' | 'company'>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly role?: RegisterRole;
  // company fields
  readonly companyName?: string;
  readonly cif?: string;
  readonly legalRepresentative?: string;
  readonly phone?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  accessToken: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  tenantId?: string;
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
  accessToken: string;
}
