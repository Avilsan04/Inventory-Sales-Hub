import * as React from 'react';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { formatQuantityWithUom } from '@shared/lib/uom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import type { Product } from '@entities/product';

interface ProductVariantsPanelProps {
  variants: Product[];
  currency?: string;
}

export function ProductVariantsPanel({
  variants,
  currency = 'EUR',
}: ProductVariantsPanelProps): React.ReactElement {
  if (variants.length === 0) {
    return (
      <p
        style={{
          padding: '0.5rem 1rem',
          color: 'var(--color-muted-foreground)',
          fontSize: '0.875rem',
        }}
      >
        No variants
      </p>
    );
  }

  return (
    <div style={{ padding: '0.5rem 1rem 1rem' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((v) => (
            <TableRow key={v.id}>
              <TableCell style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{v.sku}</TableCell>
              <TableCell>{v.name}</TableCell>
              <TableCell>{formatQuantityWithUom(1, v.uom)}</TableCell>
              <TableCell>{formatCurrency(v.price, currency)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
