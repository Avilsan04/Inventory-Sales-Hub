import type { LoginRequest, RegisterRequest } from '../models/auth.types';

export interface IAuthService {
  readonly login: (credentials: LoginRequest) => Promise<void>;
  readonly register: (payload: RegisterRequest) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly isAuthenticated: () => boolean;
}
