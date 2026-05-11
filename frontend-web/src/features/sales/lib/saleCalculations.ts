export interface SaleTotals {
  subtotal: number; // cents
  discountAmount: number; // cents
  taxAmount: number; // cents
  total: number; // cents
}

interface CalcInput {
  items: Array<{ unitPrice: number; quantity: number }>; // unitPrice in cents
  discountPercent: number; // 0-100
  taxPercent: number; // 0-100
}

export function calculateSaleTotals({ items, discountPercent, taxPercent }: CalcInput): SaleTotals {
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const taxableBase = subtotal - discountAmount;
  const taxAmount = Math.round(taxableBase * (taxPercent / 100));
  const total = taxableBase + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}
