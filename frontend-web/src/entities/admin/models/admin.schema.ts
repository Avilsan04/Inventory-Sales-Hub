import { z } from 'zod';

export const tenantStatusSchema = z.enum(['active', 'suspended', 'pending']);
export const tenantPlanSchema = z.enum(['basic', 'pro', 'enterprise']);

export const tenantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  plan: tenantPlanSchema,
  status: tenantStatusSchema,
  createdAt: z.iso.datetime(),
  ownerEmail: z.email(),
  userCount: z.number().int().nonnegative(),
});

export const tenantListSchema = z.array(tenantSchema);

export const adminMetricsSchema = z.object({
  totalTenants: z.number().int().nonnegative(),
  activeTenants: z.number().int().nonnegative(),
  suspendedTenants: z.number().int().nonnegative(),
  totalRevenueMrr: z.number().int().nonnegative(),
});

export const impersonationTokenSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.iso.datetime(),
});
