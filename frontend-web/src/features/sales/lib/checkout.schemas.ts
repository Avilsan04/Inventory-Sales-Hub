import { z } from 'zod';
import { luhnCheck, isExpiryValid } from './cardValidation';
import type { PaymentMethod } from '../models/checkout.types';

export const itemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.number().int('Must be integer').min(1, 'Min 1'),
  unitPrice: z.number().nonnegative('Must be ≥ 0'),
});

export const checkoutSchema = z
  .object({
    customerId: z.string().optional(),
    currency: z.string().length(3, 'Must be 3 characters'),
    items: z.array(itemSchema).min(1, 'Add at least one item'),
    discountPercent: z.number().min(0).max(100),
    taxPercent: z.number().min(0).max(100),
    address: z.string().min(5, 'Minimum 5 characters'),
    contactName: z.string().min(1, 'Required'),
    contactPhone: z.string().min(6, 'Minimum 6 characters'),
    notes: z.string().optional(),
    paymentMethod: z.enum(['credit_card', 'bank_transfer', 'cash_on_delivery']),
    holderName: z.string().optional(),
    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== 'credit_card') return;
    if (!data.holderName?.trim())
      ctx.addIssue({ code: 'custom', path: ['holderName'], message: 'Required' });
    if (!luhnCheck(data.cardNumber ?? ''))
      ctx.addIssue({ code: 'custom', path: ['cardNumber'], message: 'Invalid card number' });
    if (!isExpiryValid(data.expiry ?? ''))
      ctx.addIssue({
        code: 'custom',
        path: ['expiry'],
        message: 'Invalid or expired date (MM/YY)',
      });
    if (!/^\d{3,4}$/.test(data.cvv ?? ''))
      ctx.addIssue({ code: 'custom', path: ['cvv'], message: 'Must be 3-4 digits' });
  });

export type FormValues = z.infer<typeof checkoutSchema>;

type FieldPath =
  | keyof FormValues
  | `items.${number}.productId`
  | `items.${number}.quantity`
  | `items.${number}.unitPrice`;

export const STEP_FIELDS: Record<number, FieldPath[]> = {
  0: ['customerId', 'currency', 'items'],
  1: ['address', 'contactName', 'contactPhone'],
  2: ['paymentMethod', 'holderName', 'cardNumber', 'expiry', 'cvv'],
};

export const STEPS = [
  'sales.checkout.stepItems',
  'sales.checkout.stepShipping',
  'sales.checkout.stepPayment',
  'sales.checkout.stepConfirm',
];

export const PAYMENT_OPTIONS: Array<{ method: PaymentMethod; labelKey: string }> = [
  { method: 'credit_card', labelKey: 'sales.checkout.creditCard' },
  { method: 'bank_transfer', labelKey: 'sales.checkout.bankTransfer' },
  { method: 'cash_on_delivery', labelKey: 'sales.checkout.cashOnDelivery' },
];
