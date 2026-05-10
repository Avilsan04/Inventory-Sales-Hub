import * as React from 'react';
import { CartDrawer } from '@features/catalog';
import { useEffectiveRole } from '@features/auth';

export function CartButton(): React.ReactElement | null {
  const role = useEffectiveRole();
  if (role !== 'customer') return null;
  return <CartDrawer />;
}
