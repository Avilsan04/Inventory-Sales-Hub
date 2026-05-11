import type { AppDatabase } from './db';
import type { Product } from '@entities/product';
import type { InventoryItem } from '@entities/inventory';
import type { Sale } from '@entities/sale';
import type { Employee } from '@entities/employee';
import type { Notification } from '@entities/notification';
import { generateSixMonthsSales } from './seedGenerator';
import mockData from './mock-data.json';

export async function seed(database: AppDatabase): Promise<void> {
  const productCount = await database.products.count();
  if (productCount > 0) return; // already seeded

  const now = new Date().toISOString();

  const products = (mockData.products as unknown[]).map((p) => ({
    uom: 'unit',
    ...(p as object),
  })) as Product[];

  const inventory = (mockData.inventory as unknown[]).map((item) => ({
    warehouseId: 'wh-001',
    warehouseName: 'Tienda Principal',
    ...(item as object),
  })) as InventoryItem[];

  const sales = (mockData.sales as unknown[]).map((s) => ({
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    ...(s as object),
  })) as Sale[];

  await database.products.bulkAdd(products);
  await database.inventory.bulkAdd(inventory);

  // Combine existing mock sales + 6-month generated history
  const generatedSales = generateSixMonthsSales(sales.length + 1);
  await database.sales.bulkAdd([...sales, ...generatedSales]);
  await database.customers.bulkAdd(mockData.customers);
  await database.employees.bulkAdd(mockData.employees as unknown as Employee[]);
  await database.suppliers.bulkAdd(mockData.suppliers);

  await database.notifications.bulkAdd(mockData.notifications as unknown as Notification[]);

  console.info('[Seed] Database seeded at', now);
}
