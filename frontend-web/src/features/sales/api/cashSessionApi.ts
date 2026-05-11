import axios from 'axios';
import { httpClient } from '@core/http';
import { cashSessionSchema } from '@entities/cash-session';
import type { CashSession, OpenCashSessionDTO, CloseCashSessionDTO } from '@entities/cash-session';

export const cashSessionApi = {
  getCurrentSession: async (): Promise<CashSession | null> => {
    try {
      const res = await httpClient.get<CashSession>('/cash-sessions/current');
      return cashSessionSchema.parse(res);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null;
      throw err;
    }
  },

  openSession: async (dto: OpenCashSessionDTO): Promise<CashSession> => {
    const res = await httpClient.post<CashSession>('/cash-sessions/open', dto);
    return cashSessionSchema.parse(res);
  },

  closeSession: async ({
    id,
    dto,
  }: {
    id: string;
    dto: CloseCashSessionDTO;
  }): Promise<CashSession> => {
    const res = await httpClient.post<CashSession>(`/cash-sessions/${id}/close`, dto);
    return cashSessionSchema.parse(res);
  },
};
