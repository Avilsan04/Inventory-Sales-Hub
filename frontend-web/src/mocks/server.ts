/* eslint-disable no-restricted-imports -- MSW mock handlers are test infrastructure; mock files are intentionally internal and have no public API */
import { setupServer } from 'msw/node';
import { authHandlers } from '@features/auth/api/auth.mock';
import { inventoryHandlers } from '@features/inventory/api/inventory.mock';
import { productHandlers } from '@features/products/api/products.mock';
import { customerHandlers } from '@features/customers/api/customers.mock';
import { salesHandlers } from '@features/sales/api/sales.mock';
import { employeeHandlers } from '@features/employees/api/employees.mock';
import { supplierHandlers } from '@features/suppliers/api/suppliers.mock';
import { analyticsHandlers } from '@features/analytics/api/analytics.mock';
import { notificationHandlers } from '@features/notifications/api/notifications.mock';
import { adminHandlers } from '@features/admin/api/admin.mock';

export const server = setupServer(
  ...authHandlers,
  ...inventoryHandlers,
  ...productHandlers,
  ...customerHandlers,
  ...salesHandlers,
  ...employeeHandlers,
  ...supplierHandlers,
  ...analyticsHandlers,
  ...notificationHandlers,
  ...adminHandlers
);
