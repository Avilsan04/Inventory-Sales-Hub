import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { useChartColors } from '@shared/hooks/useChartColors';
import { Skeleton } from '@shared/ui/primitives';
import { formatAmount } from '@shared/lib';
import type { TopProduct } from '@entities/analytics';
import styles from '@shared/styles/themes/components/ChartTooltip.module.scss';

interface BarTooltipProps extends TooltipContentProps {
  currency: string;
}

function BarTooltip({ active, payload, currency }: BarTooltipProps): React.ReactElement | null {
  if (!active || !payload.length) return null;
  const entry = payload[0];
  if (!entry) return null;
  const v = entry.value;
  const formatted = typeof v === 'number' ? formatAmount(v, currency) : (v ?? '').toString();
  return (
    <div className={styles['tooltipContainer']}>
      <p className={styles['tooltipTitle']}>{String(entry.name ?? '')}</p>
      <p className={styles['tooltipStat']}>
        Revenue: <strong className={styles['tooltipValue']}>{formatted}</strong>
      </p>
    </div>
  );
}

interface Props {
  data: TopProduct[] | undefined;
  isLoading: boolean;
  currency?: string;
}

export function TopProductsBarChart({
  data,
  isLoading,
  currency = 'EUR',
}: Props): React.ReactElement {
  const colors = useChartColors();

  const tooltip = React.useCallback(
    (props: TooltipContentProps) => <BarTooltip {...props} currency={currency} />,
    [currency]
  );

  if (isLoading || !data) {
    return <Skeleton className={styles['donutSkeleton']} />;
  }

  const chartData = data.slice(0, 5).map((p) => ({
    name: p.productName.length > 22 ? `${p.productName.slice(0, 20)}…` : p.productName,
    Revenue: p.revenue,
  }));

  const barColors = [colors.color1, colors.color2, colors.color3, colors.color4, colors.color5];

  const formatXAxis = (v: number | string): string => {
    if (typeof v !== 'number') return v;
    return formatAmount(v >= 1000 ? v / 1000 : v, currency) + (v >= 1000 ? 'k' : '');
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        barSize={16}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: colors.textMuted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatXAxis}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: colors.textMuted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip content={tooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
        <Bar dataKey="Revenue" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            <Cell key={i} fill={barColors[i % barColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
