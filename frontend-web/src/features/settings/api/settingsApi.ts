import { httpClient } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import { z } from 'zod';

export const tenantSettingsSchema = z.object({
  companyName: z.string(),
  logoUrl: z.string().nullable(),
  currency: z.string(),
  timezone: z.string(),
});

export type TenantSettings = z.infer<typeof tenantSettingsSchema>;
export type UpdateSettingsDTO = Partial<TenantSettings>;

export const settingsApi = {
  getSettings: async (): Promise<TenantSettings> => {
    const res = await httpClient.get<unknown>('/settings');
    return parseOrThrow(tenantSettingsSchema, res);
  },

  updateSettings: async (dto: UpdateSettingsDTO): Promise<TenantSettings> => {
    const res = await httpClient.put<unknown>('/settings', dto);
    return parseOrThrow(tenantSettingsSchema, res);
  },
};
