import { z } from 'zod';
import {
  saleSchema,
  saleItemSchema,
  saleSummarySchema,
  saleStatusSchema,
  createSaleSchema,
  updateSaleStatusSchema,
  paginatedSaleSchema,
} from './sale.schema';

export type Sale = z.infer<typeof saleSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
export type SaleSummary = z.infer<typeof saleSummarySchema>;
export type SaleStatus = z.infer<typeof saleStatusSchema>;
export type CreateSaleDTO = z.infer<typeof createSaleSchema>;
export type UpdateSaleStatusDTO = z.infer<typeof updateSaleStatusSchema>;
export type PaginatedSaleResponse = z.infer<typeof paginatedSaleSchema>;
