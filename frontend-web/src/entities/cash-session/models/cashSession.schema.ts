import { z } from 'zod';

export const cashSessionSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string(),
  openingBalance: z.number().int().nonnegative(),
  closingBalance: z.number().int().nonnegative().optional(),
  expectedBalance: z.number().int().nonnegative().optional(),
  difference: z.number().int().optional(),
  status: z.enum(['open', 'closed']),
  openedAt: z.iso.datetime(),
  closedAt: z.iso.datetime().optional(),
  notes: z.string().optional(),
});

export const openCashSessionSchema = z.object({
  openingBalance: z.number().int().nonnegative(),
  notes: z.string().optional(),
});

export const closeCashSessionSchema = z.object({
  closingBalance: z.number().int().nonnegative(),
  notes: z.string().optional(),
});

export type CashSession = z.infer<typeof cashSessionSchema>;
export type OpenCashSessionDTO = z.infer<typeof openCashSessionSchema>;
export type CloseCashSessionDTO = z.infer<typeof closeCashSessionSchema>;
