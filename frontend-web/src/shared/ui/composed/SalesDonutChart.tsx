import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { useChartColors } from '@shared/hooks/useChartColors';
import { Skeleton } from '@shared/ui/primitives';
import { formatAmount } from '@shared/lib';
import styles from '@shared/styles/themes/components/ChartTooltip.module.scss';

export interface StatusSlice {
  status: string;
  count: number;
  revenue: number;
}

interface StatusTooltipProps extends TooltipContentProps {
  currency: string;
}

function StatusTooltip({
  active,
  payload,
  currency,
}: StatusTooltipProps): React.ReactElement | null {
  if (!active || !payload.length) return null;
  const entry = payload[0];
  if (!entry) return null;
  const slice = entry.payload as StatusSlice;
  return (
    <div className={styles.tooltipContainer}>
      <p className={styles.tooltipTitle}>{slice.status}</p>
      <p className={styles.tooltipStat}>
        Orders: <strong>{slice.count}</strong>
      </p>
      <p className={styles.tooltipStat}>
        Revenue: <strong>{formatAmount(slice.revenue, currency)}</strong>
      </p>
    </div>
  );
}

interface Props {
  data: StatusSlice[] | undefined;
  isLoading: boolean;
  currency?: string;
}

const RADIAN = Math.PI / 180;

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

function renderCustomLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: LabelProps): React.ReactElement | null {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function SalesDonutChart({ data, isLoading, currency = 'EUR' }: Props): React.ReactElement {
  const colors = useChartColors();

  const tooltip = React.useCallback(
    (props: TooltipContentProps) => <StatusTooltip {...props} currency={currency} />,
    [currency]
  );

  if (isLoading || !data) {
    return <Skeleton className={styles.donutSkeleton} />;
  }

  const filtered = data.filter((s) => s.count > 0);
  const sliceColors = [colors.color2, colors.color3, colors.color5, colors.color4, colors.color1];

  return (
    <div className={styles.donutWrapper}>
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            labelLine={false}
            label={renderCustomLabel}
          >
            {filtered.map((_, i) => (
              // eslint-disable-next-line @typescript-eslint/no-deprecated
              <Cell key={i} fill={sliceColors[i % sliceColors.length]} />
            ))}
          </Pie>
          <Tooltip content={tooltip} />
        </PieChart>
      </ResponsiveContainer>

      <div className={styles.legend}>
        {filtered.map((slice, i) => (
          <div key={slice.status} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: sliceColors[i % sliceColors.length] }}
            />
            <span className={styles.legendLabel}>{slice.status}</span>
            <span className={styles.legendValue}>{slice.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
