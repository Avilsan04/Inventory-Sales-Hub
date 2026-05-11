import * as React from 'react';
import { useTheme } from './useTheme';

export interface ChartColors {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  destructive: string;
  border: string;
  textMuted: string;
  cardBg: string;
}

export function useChartColors(): ChartColors {
  const { theme } = useTheme();
  return React.useMemo((): ChartColors => {
    const style = getComputedStyle(document.documentElement);
    const get = (v: string): string => style.getPropertyValue(v).trim();
    return {
      color1: get('--color-chart-1'),
      color2: get('--color-chart-2'),
      color3: get('--color-chart-3'),
      color4: get('--color-chart-4'),
      color5: get('--color-chart-5'),
      destructive: get('--color-destructive'),
      border: get('--color-border'),
      textMuted: get('--color-text-muted'),
      cardBg: get('--color-card'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}
