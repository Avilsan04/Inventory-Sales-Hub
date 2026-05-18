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

import { formatAmount } from '@shared/lib';

function formatPeriodLabel(period: string): string {
  if (period.length === 10) {
    // Daily: YYYY-MM-DD → "19 Apr"
    const parts = period.split('-');
    const mm = parts[1] ?? '';
    const dd = parts[2] ?? '';
    return `${dd} ${MONTH_LABELS[mm] ?? mm}`;
  }
  // Monthly: YYYY-MM → "Apr"
  return MONTH_LABELS[period.slice(5)] ?? period.slice(5);
}

interface TooltipRow {
  entry: TooltipPayloadEntry;
  index: number;
}

interface ChartTooltipProps extends TooltipContentProps {
  currency: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: ChartTooltipProps): React.ReactElement | null {
  if (!active || !payload.length) return null;
  return (
    <div className={styles.tooltipContainer}>
      <p className={styles.tooltipLabel}>{String(label ?? '')}</p>
      {payload.map((entry, i) => {
        const row: TooltipRow = { entry, index: i };
        const v = entry.value;
        const formatted =
          typeof v === 'number' && entry.name === 'Revenue'
            ? formatAmount(v, currency)
            : String(v ?? '');
        return (
          <div key={String(row.entry.name ?? row.index)} className={styles.tooltipRow}>
            <span
              className={styles.tooltipDot}
              style={{ background: entry.color ?? 'var(--color-chart-1)' }}
            />
            <span className={styles.tooltipName}>{String(entry.name ?? '')}</span>
            <span className={styles.tooltipValue}>{formatted}</span>
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  data: SalesPeriod[] | undefined;
  isLoading: boolean;
  currency?: string;
  ariaLabel?: string;
}

export function RevenueAreaChart({
  data,
  isLoading,
  currency = 'EUR',
  ariaLabel = 'Revenue and orders area chart',
}: Props): React.ReactElement {
  const colors = useChartColors();

  const tooltip = React.useCallback(
    (props: TooltipContentProps) => <ChartTooltip {...props} currency={currency} />,
    [currency]
  );

  if (isLoading || !data) {
    return <Skeleton className={styles.chartSkeleton} />;
  }

  const chartData = data.map((d) => ({
    label: formatPeriodLabel(d.period),
    Revenue: d.revenue,
    Orders: d.orders,
  }));

  const xAxisInterval = chartData.length <= 10 ? 0 : Math.floor(chartData.length / 8);

  const formatYAxis = (v: number | string): string => {
    if (typeof v !== 'number') return v;
    return formatAmount(v >= 1000 ? v / 1000 : v, currency) + (v >= 1000 ? 'k' : '');
  };

  return (
    <div role="img" aria-label={ariaLabel}>
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
            dataKey="label"
            tick={{ fill: colors.textMuted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={xAxisInterval}
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
          <Tooltip content={tooltip} />
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
    </div>
  );
}
