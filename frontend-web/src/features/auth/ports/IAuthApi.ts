import type { LoginRequest, RegisterRequest } from '../models/auth.types';

export interface IAuthResponse {
    readonly token: string;
}

export interface IUserResponse {
    readonly id: number;
    readonly username: string;
    readonly email: string;
    readonly token: string;
}

export interface IAuthApi {
    readonly login: (credentials: LoginRequest) => Promise<IAuthResponse>;
    readonly register: (payload: RegisterRequest) => Promise<IUserResponse>;
    readonly logout: () => Promise<void>;
}