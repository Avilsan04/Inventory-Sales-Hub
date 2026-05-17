import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { RoleRoute } from './guards/RoleRoute';
import { DashboardResolver } from './resolvers/DashboardResolver';
import { RoleLayout } from './layouts/RoleLayout';
import { TabSyncSetup } from './setup/TabSyncSetup';
import { APP_ROUTES } from '@shared/config/routes';
import { Spinner } from '@shared/ui/primitives';
import { HttpInterceptorSetup } from '@app/providers/HttpInterceptorSetup';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  InventoryPage,
  ProductsPage,
  SalesPage,
  CustomersPage,
  EmployeesPage,
  SuppliersPage,
  AnalyticsPage,
  NotificationsPage,
  ProfilePage,
  SettingsPage,
  NotFoundPage,
  TenantsPage,
  CatalogPage,
  PosPage,
  MyOrdersPage,
  AuditPage,
} from './lazyRoutes';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

const pageFallback = (
  <div className={styles.appLoading}>
    <Spinner size="lg" />
  </div>
);

function S({ children }: { children: React.ReactNode }): React.ReactElement {
  return <React.Suspense fallback={pageFallback}>{children}</React.Suspense>;
}

export function AppRouter(): React.ReactElement {
  return (
    <BrowserRouter>
      <HttpInterceptorSetup />
      <TabSyncSetup />
      <Routes>
        <Route
          path={APP_ROUTES.LANDING}
          element={
            <S>
              <LandingPage />
            </S>
          }
        />

        <Route element={<PublicRoute />}>
          <Route
            path={APP_ROUTES.LOGIN}
            element={
              <S>
                <LoginPage />
              </S>
            }
          />
          <Route
            path={APP_ROUTES.REGISTER}
            element={
              <S>
                <RegisterPage />
              </S>
            }
          />
          <Route
            path={APP_ROUTES.FORGOT_PASSWORD}
            element={
              <S>
                <ForgotPasswordPage />
              </S>
            }
          />
          <Route
            path={APP_ROUTES.RESET_PASSWORD}
            element={
              <S>
                <ResetPasswordPage />
              </S>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleLayout />}>
            <Route
              path={APP_ROUTES.DASHBOARD}
              element={
                <S>
                  <DashboardResolver />
                </S>
              }
            />
            <Route
              path={APP_ROUTES.PROFILE}
              element={
                <S>
                  <ProfilePage />
                </S>
              }
            />
            <Route
              path={APP_ROUTES.SETTINGS}
              element={
                <S>
                  <SettingsPage />
                </S>
              }
            />
            <Route
              path={APP_ROUTES.CATALOG}
              element={
                <S>
                  <CatalogPage />
                </S>
              }
            />
            <Route
              path={APP_ROUTES.MY_ORDERS}
              element={
                <S>
                  <MyOrdersPage />
                </S>
              }
            />
            <Route
              path={APP_ROUTES.NOTIFICATIONS}
              element={
                <S>
                  <NotificationsPage />
                </S>
              }
            />

            <Route
              element={
                <RoleRoute allowedRoles={['admin', 'manager', 'staff', 'company', 'test']} />
              }
            >
              <Route
                path={APP_ROUTES.SALES}
                element={
                  <S>
                    <SalesPage />
                  </S>
                }
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'test']} />}>
              <Route
                path={APP_ROUTES.PRODUCTS}
                element={
                  <S>
                    <ProductsPage />
                  </S>
                }
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'staff', 'test']} />}>
              <Route
                path={APP_ROUTES.INVENTORY}
                element={
                  <S>
                    <InventoryPage />
                  </S>
                }
              />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={['admin', 'manager', 'staff', 'company', 'test']} />
              }
            >
              <Route
                path={APP_ROUTES.CUSTOMERS}
                element={
                  <S>
                    <CustomersPage />
                  </S>
                }
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={['admin', 'manager', 'company', 'test']} />}>
              <Route
                path={APP_ROUTES.EMPLOYEES}
                element={
                  <S>
                    <EmployeesPage />
                  </S>
                }
              />
              <Route
                path={APP_ROUTES.SUPPLIERS}
                element={
                  <S>
                    <SuppliersPage />
                  </S>
                }
              />
              <Route
                path={APP_ROUTES.ANALYTICS}
                element={
                  <S>
                    <AnalyticsPage />
                  </S>
                }
              />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={['admin', 'manager', 'staff', 'customer', 'test']} />
              }
            >
              <Route
                path={APP_ROUTES.POS}
                element={
                  <S>
                    <PosPage />
                  </S>
                }
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={['admin', 'company', 'test']} />}>
              <Route
                path={APP_ROUTES.ADMIN_TENANTS}
                element={
                  <S>
                    <TenantsPage />
                  </S>
                }
              />
              <Route
                path={APP_ROUTES.AUDIT}
                element={
                  <S>
                    <AuditPage />
                  </S>
                }
              />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <S>
              <NotFoundPage />
            </S>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
