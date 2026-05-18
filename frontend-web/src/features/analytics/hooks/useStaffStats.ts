import * as React from 'react';
import { useCashSessionData as useCashSession } from '@entities/cash-session';
import { useSalesFlatList as useSales } from '@entities/sale';
import { useLowStockList as useLowStock } from '@entities/inventory';
import type { CashSession } from '@entities/cash-session';
import type { InventoryItem } from '@entities/inventory';
import type { Sale } from '@entities/sale';

const LOW_STOCK_LIMIT = 5;

export interface StaffStats {
  cashSession: CashSession | null;
  sessionRevenue: number;
  sessionOrderCount: number;
  lowStockItems: InventoryItem[];
  recentSales: Sale[];
  currency: string;
  isLoading: boolean;
}

export function useStaffStats(): StaffStats {
  const { data: cashSession, isLoading: sessionLoading } = useCashSession();
  const { data: allSales, isLoading: salesLoading } = useSales();
  const { data: lowStock, isLoading: stockLoading } = useLowStock();

  return React.useMemo((): StaffStats => {
    const sales = allSales ?? [];

    const sessionSales =
      cashSession?.openedAt != null
        ? sales.filter((s) => new Date(s.createdAt) >= new Date(cashSession.openedAt))
        : [];

    const sessionRevenue = sessionSales.reduce((sum, s) => sum + s.total, 0);
    const currency = sales[0]?.currency ?? 'USD';

    const recentSales = [...sales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      cashSession: cashSession ?? null,
      sessionRevenue,
      sessionOrderCount: sessionSales.length,
      lowStockItems: (lowStock ?? []).slice(0, LOW_STOCK_LIMIT),
      recentSales,
      currency,
      isLoading: sessionLoading || salesLoading || stockLoading,
    };
  }, [cashSession, allSales, lowStock, sessionLoading, salesLoading, stockLoading]);
}
