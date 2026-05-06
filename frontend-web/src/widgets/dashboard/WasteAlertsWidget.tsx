import * as React from 'react';
import { TrashIcon } from 'lucide-react';
import { useWasteAlerts } from '@features/analytics';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';

export function WasteAlertsWidget(): React.ReactElement {
  const { data, isLoading } = useWasteAlerts();

  const totalLoss = (data ?? []).reduce((sum, a) => sum + a.estimatedLoss, 0);

  return (
    <Card>
      <CardHeader
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
      >
        <TrashIcon size={16} aria-hidden="true" />
        <CardTitle>Waste Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} style={{ height: '1.25rem' }} />
            ))}
          </div>
        ) : (data ?? []).length === 0 ? (
          <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
            No waste reported
          </p>
        ) : (
          <>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-muted-foreground)',
                marginBottom: '0.75rem',
              }}
            >
              Estimated loss:{' '}
              <strong style={{ color: 'var(--color-destructive)' }}>
                {formatCurrency(totalLoss, 'EUR')}
              </strong>
            </p>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {(data ?? []).map((a) => (
                <li
                  key={a.productId}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}
                >
                  <span>{a.productName}</span>
                  <span style={{ color: 'var(--color-destructive)', fontWeight: 600 }}>
                    {a.expiredUnits} units
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
