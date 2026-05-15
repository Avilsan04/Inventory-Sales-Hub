import * as React from 'react';
import { useEffectiveRole } from '@features/auth';

const DashboardPage = React.lazy(() =>
  import('@pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const CustomerDashboardPage = React.lazy(() =>
  import('@pages/dashboard/CustomerDashboardPage').then((m) => ({
    default: m.CustomerDashboardPage,
  }))
);
const CompanyDashboardPage = React.lazy(() =>
  import('@pages/dashboard/CompanyDashboardPage').then((m) => ({ default: m.CompanyDashboardPage }))
);
const ManagerDashboardPage = React.lazy(() =>
  import('@pages/dashboard/ManagerDashboardPage').then((m) => ({ default: m.ManagerDashboardPage }))
);
const StaffDashboardPage = React.lazy(() =>
  import('@pages/dashboard/StaffDashboardPage').then((m) => ({ default: m.StaffDashboardPage }))
);

export function DashboardResolver(): React.ReactElement {
  const role = useEffectiveRole();
  if (role === 'customer') return <CustomerDashboardPage />;
  if (role === 'company') return <CompanyDashboardPage />;
  if (role === 'manager') return <ManagerDashboardPage />;
  if (role === 'staff') return <StaffDashboardPage />;
  return <DashboardPage />;
}
