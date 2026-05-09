import * as React from 'react';
import { CartDrawer } from '@features/catalog/components/CartDrawer';
import { useEffectiveRole } from '@features/auth';

export function CartButton(): React.ReactElement | null {
  const role = useEffectiveRole();
  if (role !== 'customer') return null;
  return <CartDrawer />;
}
