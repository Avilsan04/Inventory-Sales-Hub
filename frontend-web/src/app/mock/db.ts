import Dexie, { type Table } from 'dexie';
import type { Product } from '@entities/product';
import type { InventoryItem } from '@entities/inventory';
import type { Sale } from '@entities/sale';
import type { Customer } from '@entities/customer';
import type { Employee } from '@entities/employee';
import type { Supplier } from '@entities/supplier';
import type { Notification } from '@entities/notification';
import type { AuditLog } from '@entities/audit';

export class AppDatabase extends Dexie {
  products!: Table<Product>;
  inventory!: Table<InventoryItem>;
  sales!: Table<Sale>;
  customers!: Table<Customer>;
  employees!: Table<Employee>;
  suppliers!: Table<Supplier>;
  notifications!: Table<Notification>;
  auditLogs!: Table<AuditLog>;

  constructor() {
    super('InventorySalesHub');
    this.version(1).stores({
      products: 'id, sku, name, categoryId, parentId, isActive',
      inventory: 'id, sku, name, status, warehouseId, isActive',
      sales: 'id, customerId, status, createdAt',
      customers: 'id, email, name',
      employees: 'id, email, role',
      suppliers: 'id, name',
      notifications: 'id, isRead, createdAt',
      auditLogs: 'id, entityType, userId, timestamp',
    });
  }
}

export const db = new AppDatabase();

export async function resetDemoData(): Promise<void> {
  await db.delete();
  const fresh = new AppDatabase();
  const { seed } = await import('./seed');
  await seed(fresh);
  // Reload to re-wire the module-level db reference
  window.location.reload();
}
