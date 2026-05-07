/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PaymentMethod } from '../models/checkout.types';

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

export interface CartState {
  items: CartItem[];
  customerId: string | null;
  paymentMethod: PaymentMethod;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  changeQty: (productId: string, delta: number) => void;
  setCustomer: (id: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      customerId: null,
      paymentMethod: 'cash_on_delivery' as PaymentMethod,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            if (existing.quantity >= item.maxStock) return state;
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      changeQty: (productId, delta) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
            .filter((i) => i.quantity > 0),
        })),

      setCustomer: (id) => set({ customerId: id }),

      setPaymentMethod: (method) => set({ paymentMethod: method }),

      clearCart: () => set({ items: [], customerId: null, paymentMethod: 'cash_on_delivery' }),
    }),
    {
      name: 'pos-cart',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
