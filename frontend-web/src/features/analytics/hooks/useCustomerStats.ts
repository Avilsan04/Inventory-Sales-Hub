import * as React from 'react';
import { useSalesFlat as useSales } from '@features/sales';
import { useAuthMe } from '@features/auth';
import type { Sale } from '@entities/sale';

export interface CustomerStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
  currency: string;
  recentOrders: Sale[];
  isLoading: boolean;
}

export function useCustomerStats(): CustomerStats {
  const { data: me, isLoading: meLoading } = useAuthMe();
  const { data: allSales, isLoading: salesLoading } = useSales();

  return React.useMemo((): CustomerStats => {
    const myOrders = (allSales ?? []).filter((s) => s.customerId === String(me?.id ?? ''));
    const completed = myOrders.filter((s) => s.status === 'completed');
    const pending = myOrders.filter((s) => s.status === 'pending');
    const totalSpent = completed.reduce((sum, s) => sum + s.total, 0);
    const currency = myOrders[0]?.currency ?? 'USD';
    const recentOrders = [...myOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalOrders: myOrders.length,
      completedOrders: completed.length,
      pendingOrders: pending.length,
      totalSpent,
      currency,
      recentOrders,
      isLoading: meLoading || salesLoading,
    };
  }, [allSales, me, meLoading, salesLoading]);
}
