import type { Sale } from '@entities/sale';

// Linear Congruential Generator for deterministic data
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rng = lcg(42);

function randomInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

function dateStr(d: Date): string {
  return d.toISOString();
}

function isoDate(y: number, m: number, day: number): Date {
  return new Date(y, m - 1, day, randomInt(8, 20), randomInt(0, 59));
}

const PRODUCT_IDS = ['p-001', 'p-002', 'p-003', 'p-004', 'p-005'];
const CUSTOMER_IDS = ['c-001', 'c-002', 'c-003', 'c-004', 'c-005'];
const EMPLOYEE_IDS = ['emp-001', 'emp-002'];
const CURRENCIES = ['EUR'];

// Pareto: top 2 products generate 80% of revenue
const PRODUCT_WEIGHTS = [0.4, 0.4, 0.1, 0.05, 0.05];

function weightedProduct(): string {
  const r = rng();
  let acc = 0;
  for (let i = 0; i < PRODUCT_WEIGHTS.length; i++) {
    acc += PRODUCT_WEIGHTS[i] ?? 0;
    if (r < acc) return PRODUCT_IDS[i] ?? 'p-001';
  }
  return 'p-001';
}

// Volume multipliers: weekday higher, seasonal peaks
function dayVolume(date: Date): number {
  const dow = date.getDay(); // 0=Sun
  const month = date.getMonth() + 1;
  const weekdayBase = dow === 0 || dow === 6 ? 1 : 3;
  // Seasonal peaks
  const seasonal = month === 7 ? 1.5 : month === 9 ? 1.3 : month === 12 ? 2.0 : 1.0;
  return Math.round(weekdayBase * seasonal);
}

export function generateSixMonthsSales(startId: number): Sale[] {
  const today = new Date(2026, 4, 3); // 2026-05-03
  const sixMonthsAgo = new Date(2025, 11, 1); // 2025-12-01
  const sales: Sale[] = [];
  let idCounter = startId;

  const cursor = new Date(sixMonthsAgo);
  while (cursor <= today) {
    const count = dayVolume(cursor);
    for (let i = 0; i < count; i++) {
      const itemCount = randomInt(1, 3);
      const items = Array.from({ length: itemCount }, (_, j) => {
        const productId = weightedProduct();
        const qty = randomInt(1, 5);
        const unitPrice = randomInt(500, 5000); // cents
        return {
          id: `si-auto-${idCounter}-${j}`,
          saleId: `auto-${idCounter}`,
          productId,
          productName: `Product ${productId}`,
          quantity: qty,
          unitPrice,
          subtotal: qty * unitPrice,
        };
      });
      const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
      const taxAmount = Math.round(subtotal * 0.21);
      const total = subtotal + taxAmount;
      const saleDate = isoDate(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
      const sale: Sale = {
        id: `auto-${idCounter}`,
        customerId: pick(CUSTOMER_IDS),
        employeeId: pick(EMPLOYEE_IDS),
        status: rng() > 0.05 ? 'completed' : 'cancelled',
        subtotal,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 21,
        taxAmount,
        total,
        currency: pick(CURRENCIES),
        items,
        createdAt: dateStr(saleDate),
        updatedAt: dateStr(saleDate),
      };
      sales.push(sale);
      idCounter++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return sales;
}
