import type {
  Sale,
  SaleItem,
  SaleSummary,
  CreateSaleDTO,
  UpdateSaleStatusDTO,
} from '@entities/sale';
import type { HttpRequestConfig } from '@core/http/http.types';

export interface ISalesApi {
  readonly getSales: () => Promise<Sale[]>;
  readonly getSale: (id: string) => Promise<Sale>;
  readonly getSaleItems: (id: string) => Promise<SaleItem[]>;
  readonly getSummary: () => Promise<SaleSummary>;
  readonly createSale: (data: CreateSaleDTO, config?: HttpRequestConfig) => Promise<Sale>;
  readonly updateStatus: (id: string, data: UpdateSaleStatusDTO) => Promise<Sale>;
}
