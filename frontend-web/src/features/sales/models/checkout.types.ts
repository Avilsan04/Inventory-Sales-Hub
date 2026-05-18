export type { PaymentMethod } from '@entities/cart';

export interface ShippingDetails {
  address: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
}

export interface CreditCardPayment {
  method: 'credit_card';
  holderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface BankTransferPayment {
  method: 'bank_transfer';
}

export interface CashOnDeliveryPayment {
  method: 'cash_on_delivery';
}

export type PaymentDetails = CreditCardPayment | BankTransferPayment | CashOnDeliveryPayment;

export interface CheckoutItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutFormData {
  customerId?: string;
  currency: string;
  items: CheckoutItemForm[];
  shipping: ShippingDetails;
  payment: PaymentDetails;
}

export const MOCK_BANK_IBAN = 'ES91 2100 0418 4502 0005 1332';
