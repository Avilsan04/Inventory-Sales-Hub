import type { IAuthService } from './IAuthService';
import type { IAuthApi } from '../ports/IAuthApi';
import type { ITokenStorage } from '@core/storage/ITokenStorage';
import type { LoginRequest, RegisterRequest } from '../models/auth.types';
import { AUTH_VALIDATION_RULES } from '../models/auth.constants';

export class AuthService implements IAuthService {
  public constructor(
    private readonly _authApi: IAuthApi,
    private readonly _tokenStorage: ITokenStorage,
  ) { }
  public isAuthenticated(): boolean {
    const token = this._tokenStorage.getToken();
    return typeof token === 'string' && token.trim().length > 0;
  }
  public async login(credentials: LoginRequest, rememberMe: boolean): Promise<void> {
    if (credentials.email.trim().length === 0 || credentials.password.length === 0) {
      throw new Error('[Security Validation] Empty login request payload.');
    }

    const response = await this._authApi.login(credentials);
    if (response.token.trim().length === 0) {
      throw new Error('[Security Validation] Empty token received from authentication provider.');
    }

    this._tokenStorage.saveToken(response.token, rememberMe);
  }

  public async register(data: RegisterRequest): Promise<void> {
    if (
      data.username.trim().length < AUTH_VALIDATION_RULES.MIN_USERNAME_LENGTH ||
      data.email.trim().length === 0 ||
      data.password.length < AUTH_VALIDATION_RULES.MIN_PASSWORD_LENGTH
    ) {
      throw new Error('[Security Validation] Invalid register request payload.');
    }

    const response = await this._authApi.register(data);
    if (response.token.trim().length === 0) {
      throw new Error('[Security Validation] Empty token received from authentication provider.');
    }

    this._tokenStorage.saveToken(response.token, false);
  }

  public async logout(): Promise<void> {
    this._tokenStorage.removeToken();

    try {
      await this._authApi.logout();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown network failure';
      console.warn('[Telemetry] Remote logout failed. Local session securely destroyed. Details:', errorMessage);
    }
  }
}