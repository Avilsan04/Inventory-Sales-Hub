import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { APP_ROUTES } from '@shared/config/routes';

export function useImpersonation(): {
  startImpersonation: (tenantId: string) => Promise<void>;
  stopImpersonation: () => void;
  isImpersonating: boolean;
} {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const startImpersonation = async (tenantId: string): Promise<void> => {
    const { token } = await adminApi.getImpersonationToken(tenantId);
    sessionStorage.setItem('impersonation_token', token);
    queryClient.clear();
    void navigate(APP_ROUTES.DASHBOARD);
  };

  const stopImpersonation = (): void => {
    sessionStorage.removeItem('impersonation_token');
    queryClient.clear();
    void navigate(APP_ROUTES.ADMIN_TENANTS);
  };

  return {
    startImpersonation,
    stopImpersonation,
    isImpersonating: sessionStorage.getItem('impersonation_token') !== null,
  };
}
