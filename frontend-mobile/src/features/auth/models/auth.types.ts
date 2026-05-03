export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}
