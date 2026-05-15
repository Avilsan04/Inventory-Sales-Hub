import * as React from 'react';
import { AdminLayout, CompanyLayout, ClientLayout } from '@widgets';
import { useEffectiveRole, useAuthMe } from '@features/auth';
import { Spinner } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/RoleLayout.module.scss';

export function RoleLayout(): React.ReactElement {
  const { isLoading } = useAuthMe();
  const role = useEffectiveRole();

  if (isLoading) {
    return (
      <div className={styles['loadingContainer']}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (role === 'company') return <CompanyLayout />;
  if (role === 'customer') return <ClientLayout />;
  return <AdminLayout />;
}
