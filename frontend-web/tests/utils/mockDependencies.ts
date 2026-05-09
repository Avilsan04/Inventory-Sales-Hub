import { vi } from 'vitest';
import type { IAuthService } from '../../src/features/auth/services/IAuthService';

export function createMockAuthService(): IAuthService {
    return {
        isAuthenticated: vi.fn().mockReturnValue(false),
        login: vi.fn().mockResolvedValue(undefined),
        logout: vi.fn().mockResolvedValue(undefined),
        register: vi.fn().mockResolvedValue(undefined),
    };
}
