export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash_on_delivery';

export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  /** Unit price in cents */
  unitPrice: number;
  currency: string;
  quantity: number;
  maxStock: number;
}
