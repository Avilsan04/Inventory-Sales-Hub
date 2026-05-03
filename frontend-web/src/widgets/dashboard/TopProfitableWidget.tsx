import * as React from 'react';
import { TrophyIcon } from 'lucide-react';
import { useTopProducts } from '@features/analytics';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';

export function TopProfitableWidget(): React.ReactElement {
  const { data, isLoading } = useTopProducts();
  const top5 = data?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
      >
        <TrophyIcon size={16} aria-hidden="true" />
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} style={{ height: '1.25rem' }} />
            ))}
          </div>
        ) : top5.length === 0 ? (
          <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>No data</p>
        ) : (
          <ol
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
            }}
          >
            {top5.map((p, i) => (
              <li
                key={p.productId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span
                    style={{ color: 'var(--color-muted-foreground)', width: '1rem', flexShrink: 0 }}
                  >
                    {i + 1}.
                  </span>
                  <span>{p.productName}</span>
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {formatCurrency(p.revenue, 'EUR')}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
