import * as React from 'react';
import { TrendingUpIcon } from 'lucide-react';
import { useCashFlow } from '@features/analytics';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';

export function CashFlowWidget(): React.ReactElement {
  const { data, isLoading } = useCashFlow();

  const totalNet = (data ?? []).reduce((sum, e) => sum + e.net, 0);
  const totalInflow = (data ?? []).reduce((sum, e) => sum + e.inflow, 0);
  const totalOutflow = (data ?? []).reduce((sum, e) => sum + e.outflow, 0);

  return (
    <Card>
      <CardHeader
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
      >
        <TrendingUpIcon size={16} aria-hidden="true" />
        <CardTitle>Cash Flow (7d)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton style={{ height: '2rem', width: '10rem' }} />
            <Skeleton style={{ height: '1rem', width: '14rem' }} />
          </div>
        ) : (
          <>
            <p
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: totalNet >= 0 ? 'var(--color-success)' : 'var(--color-destructive)',
              }}
            >
              {totalNet >= 0 ? '+' : ''}
              {formatCurrency(totalNet, 'EUR')}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--color-muted-foreground)',
              }}
            >
              <span>
                In:{' '}
                <strong style={{ color: 'var(--color-success)' }}>
                  {formatCurrency(totalInflow, 'EUR')}
                </strong>
              </span>
              <span>
                Out:{' '}
                <strong style={{ color: 'var(--color-destructive)' }}>
                  {formatCurrency(totalOutflow, 'EUR')}
                </strong>
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
