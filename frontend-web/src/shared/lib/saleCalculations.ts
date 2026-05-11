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
