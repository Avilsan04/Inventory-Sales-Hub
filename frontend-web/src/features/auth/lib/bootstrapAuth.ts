import { authApi } from '../api/authApi';
import { tokenStorage } from '@core/storage/tokenStorage';
import { tenantStorage } from '@core/storage/tenantStorage';
import { logger } from '@shared/lib/logger';

/**
 * Called once before the React tree mounts.
 * Attempts a silent token refresh using the HttpOnly refresh cookie.
 * On success: stores the new access token and tenant context.
 * On failure: silently clears any stale token — user will hit the login guard.
 */
export async function bootstrapAuth(): Promise<void> {
  try {
    const { accessToken } = await authApi.refresh();
    tokenStorage.saveToken(accessToken);

    const profile = await authApi.getMe();
    if (profile.tenantId) {
      tenantStorage.setTenantId(profile.tenantId);
    }
  } catch {
    tokenStorage.removeToken();
    logger.warn('[Bootstrap] Silent refresh failed — unauthenticated session.');
  }
}
