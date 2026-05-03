import { httpClient } from '@core/http';
import { cashSessionSchema } from '@entities/cash-session';
import type { CashSession, OpenCashSessionDTO, CloseCashSessionDTO } from '@entities/cash-session';

export const cashSessionApi = {
  getCurrentSession: async (): Promise<CashSession | null> => {
    try {
      const res = await httpClient.get<unknown>('/cash-sessions/current');
      return cashSessionSchema.parse(res);
    } catch {
      return null;
    }
  },

  openSession: async (dto: OpenCashSessionDTO): Promise<CashSession> => {
    const res = await httpClient.post<unknown>('/cash-sessions/open', dto);
    return cashSessionSchema.parse(res);
  },

  closeSession: async ({
    id,
    dto,
  }: {
    id: string;
    dto: CloseCashSessionDTO;
  }): Promise<CashSession> => {
    const res = await httpClient.post<unknown>(`/cash-sessions/${id}/close`, dto);
    return cashSessionSchema.parse(res);
  },
};
