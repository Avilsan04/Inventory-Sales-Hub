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
import type { TopProduct } from '@entities/analytics';

function BarTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
    if (!active || !payload.length) return null;
    const entry = payload[0];
    if (!entry) return null;
    const v = entry.value;
    const formatted = typeof v === 'number' ? `$${v.toLocaleString()}` : (v ?? '').toString();
    return (
        <div style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: 'var(--shadow-sm)',
            fontSize: 12,
        }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {String(entry.name ?? '')}
            </p>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                Revenue: <strong style={{ color: 'var(--color-text-primary)' }}>{formatted}</strong>
            </p>
        </div>
    );
}

interface Props {
    data: TopProduct[] | undefined;
    isLoading: boolean;
}

export function TopProductsBarChart({ data, isLoading }: Props): React.ReactElement {
    const colors = useChartColors();

    if (isLoading || !data) {
        return <Skeleton style={{ height: 220, borderRadius: 8 }} />;
    }

    const chartData = data.slice(0, 5).map((p) => ({
        name: p.productName.length > 22 ? `${p.productName.slice(0, 20)}…` : p.productName,
        Revenue: p.revenue,
    }));

    const barColors = [colors.color1, colors.color2, colors.color3, colors.color4, colors.color5];

    const formatXAxis = (v: number | string): string => {
        if (typeof v !== 'number') return v;
        return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${String(v)}`;
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
                <Tooltip content={BarTooltip} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
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
