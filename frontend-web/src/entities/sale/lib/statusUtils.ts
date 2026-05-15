import type { BadgeVariant } from '@shared/ui';
import type { SaleStatus } from '../models/sale.types';

const SALE_STATUS_BADGE: Partial<Record<SaleStatus, BadgeVariant>> = {
  completed: 'success',
  pending: 'warning',
  cancelled: 'destructive',
};

export function getSaleStatusBadgeVariant(status: string): BadgeVariant {
  return SALE_STATUS_BADGE[status as SaleStatus] ?? 'neutral';
}

export function lookupCustomerName(
  customerId: string | undefined,
  map: Map<string, string>
): string {
  if (customerId === undefined) return '—';
  return map.get(customerId) ?? `#${customerId.slice(0, 8)}`;
}
