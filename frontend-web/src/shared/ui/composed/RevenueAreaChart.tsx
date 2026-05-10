import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { TooltipContentProps, TooltipPayloadEntry } from 'recharts';
import { useChartColors } from '@shared/hooks/useChartColors';
import { Skeleton } from '@shared/ui/primitives';
import type { SalesPeriod } from '@entities/analytics';
import styles from '@shared/styles/themes/components/ChartTooltip.module.scss';

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
};

interface TooltipRow {
  entry: TooltipPayloadEntry;
  index: number;
}

function formatTooltipValue(entry: TooltipPayloadEntry): string {
  const v = entry.value;
  if (typeof v !== 'number') return String(v ?? '');
  return entry.name === 'Revenue' ? `$${v.toLocaleString()}` : v.toString();
}

function ChartTooltip({ active, payload, label }: TooltipContentProps): React.ReactElement | null {
  if (!active || !payload.length) return null;
  return (
    <div className={styles.tooltipContainer}>
      <p className={styles.tooltipLabel}>{String(label ?? '')}</p>
      {payload.map((entry, i) => {
        const row: TooltipRow = { entry, index: i };
        return (
          <div key={String(row.entry.name ?? row.index)} className={styles.tooltipRow}>
            <span
              className={styles.tooltipDot}
              style={{ background: entry.color ?? 'var(--color-chart-1)' }}
            />
            <span className={styles.tooltipName}>{String(entry.name ?? '')}</span>
            <span className={styles.tooltipValue}>{formatTooltipValue(entry)}</span>
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  data: SalesPeriod[] | undefined;
  isLoading: boolean;
}

export function RevenueAreaChart({ data, isLoading }: Props): React.ReactElement {
  const colors = useChartColors();

  if (isLoading || !data) {
    return <Skeleton className={styles.chartSkeleton} />;
  }

  const chartData = data.map((d) => ({
    month: MONTH_LABELS[d.period.slice(5)] ?? d.period.slice(5),
    Revenue: d.revenue,
    Orders: d.orders,
  }));

  const formatYAxis = (v: number | string): string => {
    if (typeof v !== 'number') return v;
    return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${String(v)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.color1} stopOpacity={0.18} />
            <stop offset="95%" stopColor={colors.color1} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.color2} stopOpacity={0.18} />
            <stop offset="95%" stopColor={colors.color2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: colors.textMuted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: colors.textMuted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
          width={48}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: colors.textMuted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={ChartTooltip} />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="Revenue"
          stroke={colors.color1}
          fill="url(#gradRevenue)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="Orders"
          stroke={colors.color2}
          fill="url(#gradOrders)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
