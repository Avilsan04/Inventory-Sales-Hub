import * as React from 'react';

export const LandingPage = React.lazy(() =>
  import('@pages/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
export const LoginPage = React.lazy(() =>
  import('@pages/login/LoginPage').then((m) => ({ default: m.LoginPage }))
);
export const RegisterPage = React.lazy(() =>
  import('@pages/register/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
export const ForgotPasswordPage = React.lazy(() =>
  import('@pages/login/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
export const ResetPasswordPage = React.lazy(() =>
  import('@pages/login/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
export const InventoryPage = React.lazy(() =>
  import('@pages/inventory/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
export const ProductsPage = React.lazy(() =>
  import('@pages/products/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
export const SalesPage = React.lazy(() =>
  import('@pages/sales/SalesPage').then((m) => ({ default: m.SalesPage }))
);
export const CustomersPage = React.lazy(() =>
  import('@pages/customers/CustomersPage').then((m) => ({ default: m.CustomersPage }))
);
export const EmployeesPage = React.lazy(() =>
  import('@pages/employees/EmployeesPage').then((m) => ({ default: m.EmployeesPage }))
);
export const SuppliersPage = React.lazy(() =>
  import('@pages/suppliers/SuppliersPage').then((m) => ({ default: m.SuppliersPage }))
);
export const AnalyticsPage = React.lazy(() =>
  import('@pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
export const NotificationsPage = React.lazy(() =>
  import('@pages/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
export const ProfilePage = React.lazy(() =>
  import('@pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
export const SettingsPage = React.lazy(() =>
  import('@pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
export const NotFoundPage = React.lazy(() =>
  import('@pages/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
export const TenantsPage = React.lazy(() =>
  import('@pages/admin/TenantsPage').then((m) => ({ default: m.TenantsPage }))
);
export const CatalogPage = React.lazy(() =>
  import('@pages/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage }))
);
export const PosPage = React.lazy(() =>
  import('@pages/pos/PosPage').then((m) => ({ default: m.PosPage }))
);
export const MyOrdersPage = React.lazy(() =>
  import('@pages/my-orders/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage }))
);
export const AuditPage = React.lazy(() =>
  import('@pages/audit/AuditPage').then((m) => ({ default: m.AuditPage }))
);
