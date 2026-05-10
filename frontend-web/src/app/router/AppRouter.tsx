import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout, CompanyLayout, ClientLayout } from '@widgets';
import { useEffectiveRole, useAuthMe } from '@features/auth';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { RoleRoute } from './guards/RoleRoute';
import { APP_ROUTES } from '@shared/config/routes';
import { Spinner } from '@shared/ui/primitives';
import { HttpInterceptorSetup } from '@app/providers/HttpInterceptorSetup';
import { useTabSync } from '@features/auth';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

const LandingPage = React.lazy(() =>
  import('@pages/landing/LandingPage').then((module) => ({ default: module.LandingPage }))
);

const LoginPage = React.lazy(() =>
  import('@pages/login/LoginPage').then((module) => ({ default: module.LoginPage }))
);

const RegisterPage = React.lazy(() =>
  import('@pages/register/RegisterPage').then((module) => ({ default: module.RegisterPage }))
);

const ForgotPasswordPage = React.lazy(() =>
  import('@pages/login/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);

const ResetPasswordPage = React.lazy(() =>
  import('@pages/login/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage }))
);

const DashboardPage = React.lazy(() =>
  import('@pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);

const CustomerDashboardPage = React.lazy(() =>
  import('@pages/dashboard/CustomerDashboardPage').then((module) => ({
    default: module.CustomerDashboardPage,
  }))
);

const CompanyDashboardPage = React.lazy(() =>
  import('@pages/dashboard/CompanyDashboardPage').then((module) => ({
    default: module.CompanyDashboardPage,
  }))
);

const ManagerDashboardPage = React.lazy(() =>
  import('@pages/dashboard/ManagerDashboardPage').then((module) => ({
    default: module.ManagerDashboardPage,
  }))
);

const StaffDashboardPage = React.lazy(() =>
  import('@pages/dashboard/StaffDashboardPage').then((module) => ({
    default: module.StaffDashboardPage,
  }))
);

const InventoryPage = React.lazy(() =>
  import('@pages/inventory/InventoryPage').then((module) => ({ default: module.InventoryPage }))
);

const ProductsPage = React.lazy(() =>
  import('@pages/products/ProductsPage').then((module) => ({ default: module.ProductsPage }))
);

const SalesPage = React.lazy(() =>
  import('@pages/sales/SalesPage').then((module) => ({ default: module.SalesPage }))
);

const CustomersPage = React.lazy(() =>
  import('@pages/customers/CustomersPage').then((module) => ({ default: module.CustomersPage }))
);

const EmployeesPage = React.lazy(() =>
  import('@pages/employees/EmployeesPage').then((module) => ({ default: module.EmployeesPage }))
);

const SuppliersPage = React.lazy(() =>
  import('@pages/suppliers/SuppliersPage').then((module) => ({ default: module.SuppliersPage }))
);

const AnalyticsPage = React.lazy(() =>
  import('@pages/analytics/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage }))
);

const NotificationsPage = React.lazy(() =>
  import('@pages/notifications/NotificationsPage').then((module) => ({
    default: module.NotificationsPage,
  }))
);

const ProfilePage = React.lazy(() =>
  import('@pages/profile/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);

const SettingsPage = React.lazy(() =>
  import('@pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage }))
);

const NotFoundPage = React.lazy(() =>
  import('@pages/not-found/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);

const TenantsPage = React.lazy(() =>
  import('@pages/admin/TenantsPage').then((module) => ({ default: module.TenantsPage }))
);

const CatalogPage = React.lazy(() =>
  import('@pages/catalog/CatalogPage').then((module) => ({ default: module.CatalogPage }))
);

const PosPage = React.lazy(() =>
  import('@pages/pos/PosPage').then((module) => ({ default: module.PosPage }))
);

const MyOrdersPage = React.lazy(() =>
  import('@pages/my-orders/MyOrdersPage').then((module) => ({ default: module.MyOrdersPage }))
);

const AuditPage = React.lazy(() =>
  import('@pages/audit/AuditPage').then((module) => ({ default: module.AuditPage }))
);

function DashboardResolver(): React.ReactElement {
  const role = useEffectiveRole();
  if (role === 'customer') return <CustomerDashboardPage />;
  if (role === 'company') return <CompanyDashboardPage />;
  if (role === 'manager') return <ManagerDashboardPage />;
  if (role === 'staff') return <StaffDashboardPage />;
  return <DashboardPage />;
}

function RoleLayout(): React.ReactElement {
  const { isLoading } = useAuthMe();
  const role = useEffectiveRole();

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (role === 'company') return <CompanyLayout />;
  if (role === 'customer') return <ClientLayout />;
  return <AdminLayout />;
}

function TabSyncSetup(): null {
  useTabSync();
  return null;
}

export function AppRouter(): React.ReactElement {
  return (
    <BrowserRouter>
      <HttpInterceptorSetup />
      <TabSyncSetup />
      <React.Suspense
        fallback={
          <div className={styles.appLoading}>
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Landing — public, standalone layout */}
          <Route path={APP_ROUTES.LANDING} element={<LandingPage />} />

          {/* Public Layer — auth pages */}
          <Route element={<PublicRoute />}>
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={APP_ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={APP_ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Layer — application shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleLayout />}>
              {/* Customer/company-accessible routes */}
              <Route path={APP_ROUTES.DASHBOARD} element={<DashboardResolver />} />
              <Route path={APP_ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={APP_ROUTES.SETTINGS} element={<SettingsPage />} />
              <Route path={APP_ROUTES.CATALOG} element={<CatalogPage />} />
              <Route path={APP_ROUTES.MY_ORDERS} element={<MyOrdersPage />} />

              {/* COMPANY + ADMIN + MANAGER + STAFF: sales */}
              <Route
                element={
                  <RoleRoute allowedRoles={['admin', 'manager', 'staff', 'company', 'test']} />
                }
              >
                <Route path={APP_ROUTES.SALES} element={<SalesPage />} />
              </Route>

              {/* ADMIN + MANAGER: product management */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'test']} />}>
                <Route path={APP_ROUTES.PRODUCTS} element={<ProductsPage />} />
              </Route>

              {/* ADMIN + MANAGER + STAFF: inventory */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'staff', 'test']} />}>
                <Route path={APP_ROUTES.INVENTORY} element={<InventoryPage />} />
              </Route>

              {/* COMPANY + ADMIN + MANAGER: employee management */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'company', 'test']} />}>
                <Route path={APP_ROUTES.EMPLOYEES} element={<EmployeesPage />} />
              </Route>

              {/* COMPANY + ADMIN + MANAGER: supplier management */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'company', 'test']} />}>
                <Route path={APP_ROUTES.SUPPLIERS} element={<SuppliersPage />} />
              </Route>

              {/* ADMIN + MANAGER + STAFF: customer management */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'staff', 'test']} />}>
                <Route path={APP_ROUTES.CUSTOMERS} element={<CustomersPage />} />
              </Route>

              {/* ADMIN + MANAGER + STAFF + CUSTOMER: POS */}
              <Route
                element={
                  <RoleRoute allowedRoles={['admin', 'manager', 'staff', 'customer', 'test']} />
                }
              >
                <Route path={APP_ROUTES.POS} element={<PosPage />} />
              </Route>

              {/* COMPANY + ADMIN + MANAGER: analytics */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'company', 'test']} />}>
                <Route path={APP_ROUTES.ANALYTICS} element={<AnalyticsPage />} />
              </Route>

              {/* All authenticated users */}
              <Route path={APP_ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />

              {/* COMPANY + ADMIN: tenant/permission management */}
              <Route element={<RoleRoute allowedRoles={['admin', 'company', 'test']} />}>
                <Route path={APP_ROUTES.ADMIN_TENANTS} element={<TenantsPage />} />
              </Route>

              {/* COMPANY + ADMIN: audit log */}
              <Route element={<RoleRoute allowedRoles={['admin', 'company', 'test']} />}>
                <Route path={APP_ROUTES.AUDIT} element={<AuditPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}
