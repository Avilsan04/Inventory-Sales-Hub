export interface LoginRequest {
  email: string;
  password: string;
}

export type RegisterRole = 'customer' | 'admin' | 'company';

export interface RegisterRequest {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly role?: RegisterRole;
  // admin fields
  readonly fullName?: string;
  readonly adminCode?: string;
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
  token: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'customer' | 'test' | 'company';
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
