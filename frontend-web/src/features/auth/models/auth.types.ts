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
