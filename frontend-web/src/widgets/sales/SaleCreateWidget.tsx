import * as React from 'react';
import { SaleCreateDialog } from '@features/sales/components/SaleCreateDialog';
import { useCustomers } from '@features/customers';
import { useProducts } from '@features/products';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleCreateWidget({ open, onOpenChange }: Props): React.ReactElement {
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();

  return (
    <SaleCreateDialog
      open={open}
      onOpenChange={onOpenChange}
      customers={customers}
      products={products}
    />
  );
}
