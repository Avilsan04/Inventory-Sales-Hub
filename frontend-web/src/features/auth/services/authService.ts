import type { IAuthService } from './IAuthService';
import type { IAuthApi } from '../ports/IAuthApi';
import type { ITokenStorage } from '@core/storage/ITokenStorage';
import { tenantStorage } from '@core/storage/tenantStorage';
import { clearAllCache } from '@core/api/queryClient';
import { broadcastTabSync } from '@shared/lib/tabSync';
import { syncDb } from '@shared/lib';
import type { LoginRequest, RegisterRequest } from '../models/auth.types';
import { AUTH_VALIDATION_RULES } from '../models/auth.constants';
import { logger } from '@shared/lib/logger';

export class AuthService implements IAuthService {
  public constructor(
    private readonly _authApi: IAuthApi,
    private readonly _tokenStorage: ITokenStorage
  ) {}

  public isAuthenticated(): boolean {
    const token = this._tokenStorage.getToken();
    return typeof token === 'string' && token.trim().length > 0;
  }

  public async login(credentials: LoginRequest): Promise<void> {
    if (credentials.email.trim().length === 0 || credentials.password.length === 0) {
      throw new Error('[Security Validation] Empty login request payload.');
    }

    const response = await this._authApi.login(credentials);
    if (response.accessToken.trim().length === 0) {
      throw new Error('[Security Validation] Empty token received from authentication provider.');
    }

    this._tokenStorage.saveToken(response.accessToken);
    broadcastTabSync({ type: 'AUTH_LOGIN' });

    try {
      const profile = await this._authApi.getMe();
      if (profile.tenantId) {
        const prevTenant = tenantStorage.getTenantId();
        if (prevTenant !== null && prevTenant !== profile.tenantId) {
          clearAllCache();
          broadcastTabSync({ type: 'TENANT_CHANGED', tenantId: profile.tenantId });
        }
        tenantStorage.setTenantId(profile.tenantId);
      }
    } catch {
      // Non-blocking — tenant header will be absent until next bootstrap or page reload.
      logger.warn('[AuthService] Could not resolve tenantId after login.');
    }
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
    if (response.accessToken.trim().length === 0) {
      throw new Error('[Security Validation] Empty token received from authentication provider.');
    }

    clearAllCache();
    this._tokenStorage.saveToken(response.accessToken);
    broadcastTabSync({ type: 'AUTH_LOGIN' });

    try {
      const profile = await this._authApi.getMe();
      if (profile.tenantId) {
        tenantStorage.setTenantId(profile.tenantId);
      }
    } catch {
      logger.warn('[AuthService] Could not resolve tenantId after register.');
    }
  }

  public async logout(): Promise<void> {
    this._tokenStorage.removeToken();
    tenantStorage.removeTenantId();
    clearAllCache();
    void syncDb.syncQueue.clear();
    broadcastTabSync({ type: 'AUTH_LOGOUT' });

    try {
      await this._authApi.logout();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown network failure';
      logger.warn(
        '[Telemetry] Remote logout failed. Local session securely destroyed. Details:',
        errorMessage
      );
    }
  }
}
