import type { LoginRequest, RegisterRequest } from '../models/auth.types';

export interface IAuthService {
    readonly login: (credentials: LoginRequest, rememberMe: boolean) => Promise<void>;
    readonly register: (payload: RegisterRequest) => Promise<void>;
    readonly logout: () => Promise<void>;
    readonly isAuthenticated: () => boolean;
}