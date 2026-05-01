import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartColors } from '@shared/hooks/useChartColors';
import { Skeleton } from '@shared/ui/primitives';

interface ChartDataPoint {
  period: string;
  revenue: number;
}

interface WeeklySalesBarChartProps {
  data?: ChartDataPoint[];
  isLoading: boolean;
}

function formatRevenue(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toLocaleString()}`;
}

export function WeeklySalesBarChart({
  data,
  isLoading,
}: WeeklySalesBarChartProps): React.ReactElement {
  const colors = useChartColors();

  const chartData = React.useMemo(() => {
    if (!data?.length) return [];
    const points = data.slice(-7).map((d) => ({
      day: new Date(d.period).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
      revenue: d.revenue,
    }));
    const max = Math.max(...points.map((p) => p.revenue), 0);
    return points.map((p) => ({
      ...p,
      fill: p.revenue === max ? colors.color1 : `${colors.color1}66`,
    }));
  }, [data, colors]);

  if (isLoading) {
    return <Skeleton style={{ height: 256, borderRadius: '0.5rem' }} />;
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart
        data={chartData}
        barCategoryGap="30%"
        margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.6} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: 'var(--color-muted)', opacity: 0.4, radius: 4 }}
          contentStyle={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 12,
            boxShadow: 'var(--shadow-base)',
          }}
          formatter={(value) => [formatRevenue(Number(value)), 'Ingresos']}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
