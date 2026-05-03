import { setupWorker } from 'msw/browser';
import { inventoryHandlers } from '@features/inventory/api/inventory.mock';
import { authHandlers } from '@features/auth/api/auth.mock';
import { productHandlers } from '@features/products/api/products.mock';
import { customerHandlers } from '@features/customers/api/customers.mock';
import { salesHandlers } from '@features/sales/api/sales.mock';
import { employeeHandlers } from '@features/employees/api/employees.mock';
import { supplierHandlers } from '@features/suppliers/api/suppliers.mock';
import { analyticsHandlers } from '@features/analytics/api/analytics.mock';
import { notificationHandlers } from '@features/notifications/api/notifications.mock';
import { adminHandlers } from '@features/admin/api/admin.mock';
import { cashSessionHandlers } from '@features/sales/api/cashSession.mock';
import { auditHandlers } from '@features/audit/api/audit.mock';
import { warehouseHandlers } from '@features/inventory/api/warehouses.mock';
import { emailQueueHandlers } from '@features/notifications/api/emailQueue.mock';

export const worker = setupWorker(
  ...authHandlers,
  ...inventoryHandlers,
  ...productHandlers,
  ...customerHandlers,
  ...salesHandlers,
  ...cashSessionHandlers,
  ...employeeHandlers,
  ...supplierHandlers,
  ...analyticsHandlers,
  ...notificationHandlers,
  ...adminHandlers,
  ...auditHandlers,
  ...warehouseHandlers,
  ...emailQueueHandlers
);
