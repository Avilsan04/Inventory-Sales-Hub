import * as React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useChartColors } from '@shared/hooks/useChartColors';

interface Props {
    data: number[];
    color?: 'primary' | 'success' | 'warning' | 'danger';
    height?: number;
}

type ColorKey = NonNullable<Props['color']>;

export function SparklineChart({ data, color = 'primary', height = 40 }: Props): React.ReactElement {
    const colors = useChartColors();

    const colorMap: Record<ColorKey, string> = {
        primary: colors.color1,
        success: colors.color2,
        warning: colors.color3,
        danger: colors.destructive,
    };

    const stroke = colorMap[color];
    const gradId = `sparkGrad_${color}`;

    const chartData = data.map((v, i) => ({ i, v }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="v"
                    stroke={stroke}
                    fill={`url(#${gradId})`}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
