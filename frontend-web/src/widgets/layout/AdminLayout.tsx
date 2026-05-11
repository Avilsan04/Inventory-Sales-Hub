import * as React from 'react';
import { ImpersonationBanner } from '@features/admin';
import { BaseLayout } from './BaseLayout';

export function AdminLayout(): React.ReactElement {
  return <BaseLayout header={<ImpersonationBanner />} />;
}
