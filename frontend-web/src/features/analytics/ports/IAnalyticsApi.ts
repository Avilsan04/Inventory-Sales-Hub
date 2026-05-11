import type {
  DashboardKpi,
  SalesPeriod,
  TopProduct,
  TopCustomer,
  InventoryValue,
  LowStockAlert,
  CashFlowEntry,
  WasteAlert,
  SalesAnalyticsParams,
} from '@entities/analytics';

export interface IAnalyticsApi {
  readonly getDashboard: () => Promise<DashboardKpi>;
  readonly getSalesAnalytics: (params?: SalesAnalyticsParams) => Promise<SalesPeriod[]>;
  readonly getTopProducts: () => Promise<TopProduct[]>;
  readonly getTopCustomers: () => Promise<TopCustomer[]>;
  readonly getInventoryValue: () => Promise<InventoryValue>;
  readonly getLowStockAlerts: () => Promise<LowStockAlert[]>;
  readonly getCashFlow: () => Promise<CashFlowEntry[]>;
  readonly getWasteAlerts: () => Promise<WasteAlert[]>;
}
