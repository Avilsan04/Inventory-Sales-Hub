import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../../src/features/auth/services/authService';
import type { IAuthApi } from '../../../src/features/auth/ports/IAuthApi';
import type { ITokenStorage } from '../../../src/core/storage/ITokenStorage';

function createMockApi(): IAuthApi {
    return {
        login: vi.fn().mockResolvedValue({ accessToken: 'test-token-123' }),
        register: vi.fn().mockResolvedValue({ accessToken: 'register-token-456' }),
        logout: vi.fn().mockResolvedValue(undefined),
        getMe: vi.fn(),
        refresh: vi.fn(),
        forgotPassword: vi.fn(),
        resetPassword: vi.fn(),
        updateProfile: vi.fn(),
        changePassword: vi.fn(),
    };
}

function createMockStorage(): ITokenStorage {
    return {
        getToken: vi.fn().mockReturnValue(null),
        saveToken: vi.fn(),
        removeToken: vi.fn(),
    };
}

describe('AuthService', () => {
    let api: IAuthApi;
    let storage: ITokenStorage;
    let service: AuthService;

    beforeEach(() => {
        api = createMockApi();
        storage = createMockStorage();
        service = new AuthService(api, storage);
    });

    describe('isAuthenticated', () => {
        it('returns false when no token', () => {
            vi.mocked(storage.getToken).mockReturnValue(null);
            expect(service.isAuthenticated()).toBe(false);
        });

        it('returns true when token present', () => {
            vi.mocked(storage.getToken).mockReturnValue('valid-token');
            expect(service.isAuthenticated()).toBe(true);
        });

        it('returns false when token is empty string', () => {
            vi.mocked(storage.getToken).mockReturnValue('');
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('login', () => {
        it('saves token in memory on success', async () => {
            await service.login({ email: 'test@test.com', password: 'password123' });
            expect(storage.saveToken).toHaveBeenCalledWith('test-token-123');
        });

        it('throws on empty email', async () => {
            await expect(service.login({ email: '', password: 'password' }))
                .rejects.toThrow('[Security Validation]');
        });

        it('throws on empty password', async () => {
            await expect(service.login({ email: 'test@test.com', password: '' }))
                .rejects.toThrow('[Security Validation]');
        });

        it('throws when api returns empty token', async () => {
            vi.mocked(api.login).mockResolvedValueOnce({ accessToken: '' });
            await expect(service.login({ email: 'test@test.com', password: 'password' }))
                .rejects.toThrow('[Security Validation]');
        });
    });

    describe('logout', () => {
        it('removes token', async () => {
            await service.logout();
            expect(storage.removeToken).toHaveBeenCalled();
        });

        it('removes token even when remote logout fails', async () => {
            vi.mocked(api.logout).mockRejectedValueOnce(new Error('Network error'));
            await service.logout();
            expect(storage.removeToken).toHaveBeenCalled();
        });
    });
});
