import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { useChartColors } from '@shared/hooks/useChartColors';
import { Skeleton } from '@shared/ui/primitives';

export interface StatusSlice {
  status: string;
  count: number;
  revenue: number;
}

function StatusTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || !payload.length) return null;
  const entry = payload[0];
  if (!entry) return null;
  const slice = entry.payload as StatusSlice;
  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <p
        style={{
          margin: '0 0 4px',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          textTransform: 'capitalize',
        }}
      >
        {slice.status}
      </p>
      <p style={{ margin: '0 0 2px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
        Orders: <strong>{slice.count}</strong>
      </p>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
        Revenue: <strong>${slice.revenue.toLocaleString()}</strong>
      </p>
    </div>
  );
}

interface Props {
  data: StatusSlice[] | undefined;
  isLoading: boolean;
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

export function SalesDonutChart({ data, isLoading }: Props): React.ReactElement {
  const colors = useChartColors();

  if (isLoading || !data) {
    return <Skeleton style={{ height: 220, borderRadius: 8 }} />;
  }

  const filtered = data.filter((s) => s.count > 0);
  const sliceColors = [colors.color2, colors.color3, colors.color5, colors.color4, colors.color1];

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
          <Tooltip content={StatusTooltip} />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((slice, i) => (
          <div key={slice.status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: sliceColors[i % sliceColors.length],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                textTransform: 'capitalize',
              }}
            >
              {slice.status}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginLeft: 'auto',
                paddingLeft: 8,
              }}
            >
              {slice.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
