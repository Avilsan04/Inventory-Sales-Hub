import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useInventoryValue } from '@features/analytics';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';

export function InventoryValueWidget(): React.ReactElement {
  const { data, isLoading } = useInventoryValue();

  return (
    <Card>
      <CardHeader
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
      >
        <PackageIcon size={16} aria-hidden="true" />
        <CardTitle>Inventory Value</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton style={{ height: '2rem', width: '8rem' }} />
        ) : (
          <>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'monospace' }}>
              {data ? formatCurrency(data.totalValue, data.currency) : '—'}
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-muted-foreground)',
                marginTop: '0.25rem',
              }}
            >
              {data?.totalItems ?? 0} SKUs tracked
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
