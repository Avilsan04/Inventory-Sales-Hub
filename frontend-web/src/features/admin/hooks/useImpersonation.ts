import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { APP_ROUTES } from '@shared/config/routes';

const IMPERSONATION_KEY = 'ish.impersonation';
const IMPERSONATION_TTL_MS = 60 * 60 * 1000; // 60 minutes

interface ImpersonationSession {
  token: string;
  expiresAt: number;
}

function readImpersonationToken(): string | null {
  try {
    const raw = sessionStorage.getItem(IMPERSONATION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ImpersonationSession;
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(IMPERSONATION_KEY);
      return null;
    }
    return session.token;
  } catch {
    return null;
  }
}

export function useImpersonation(): {
  startImpersonation: (tenantId: string) => Promise<void>;
  stopImpersonation: () => void;
  isImpersonating: boolean;
} {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const startImpersonation = async (tenantId: string): Promise<void> => {
    const { token } = await adminApi.getImpersonationToken(tenantId);
    const session: ImpersonationSession = { token, expiresAt: Date.now() + IMPERSONATION_TTL_MS };
    sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session));
    queryClient.clear();
    void navigate(APP_ROUTES.DASHBOARD);
  };

  const stopImpersonation = (): void => {
    sessionStorage.removeItem(IMPERSONATION_KEY);
    queryClient.clear();
    void navigate(APP_ROUTES.ADMIN_TENANTS);
  };

  return {
    startImpersonation,
    stopImpersonation,
    isImpersonating: readImpersonationToken() !== null,
  };
}
