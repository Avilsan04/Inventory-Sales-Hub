import * as React from 'react';
import type { TopCustomer } from '@entities/analytics';

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
}

/**
 * Derives a Map<customerId, CustomerStats> from the top-customers analytics list.
 * Accepts topCustomers as a parameter to avoid a cross-feature import (FSD compliance).
 * Use in combination with useTopCustomers() from @features/analytics.
 */
export function useCustomerTopMap(
  topCustomers: TopCustomer[] | undefined
): Map<string, CustomerStats> {
  return React.useMemo(() => {
    const map = new Map<string, CustomerStats>();
    topCustomers?.forEach((c) =>
      map.set(c.customerId, { totalOrders: c.totalOrders, totalSpent: c.totalSpent })
    );
    return map;
  }, [topCustomers]);
}
