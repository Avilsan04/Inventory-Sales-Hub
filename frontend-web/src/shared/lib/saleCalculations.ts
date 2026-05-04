export interface StatusSliceData {
  status: string;
  count: number;
  revenue: number;
}

export function computeStatusSlices(
  sales: ReadonlyArray<{ status: string; total: number }>
): StatusSliceData[] {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const s of sales) {
    const curr = map.get(s.status) ?? { count: 0, revenue: 0 };
    map.set(s.status, { count: curr.count + 1, revenue: curr.revenue + s.total });
  }
  return Array.from(map.entries()).map(([status, d]) => ({
    status,
    count: d.count,
    revenue: d.revenue,
  }));
}

export interface SaleTotals {
  subtotal: number; // cents
  discountAmount: number; // cents
  taxAmount: number; // cents
  total: number; // cents
}

interface CalcInput {
  items: Array<{ unitPrice: number; quantity: number }>; // unitPrice in cents
  discountPercent: number; // 0-100
  taxPercent: number; // 0-100
}

export function calculateSaleTotals({ items, discountPercent, taxPercent }: CalcInput): SaleTotals {
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const taxableBase = subtotal - discountAmount;
  const taxAmount = Math.round(taxableBase * (taxPercent / 100));
  const total = taxableBase + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}
