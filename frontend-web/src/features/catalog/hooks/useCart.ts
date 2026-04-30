import * as React from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  maxStock: number;
}

export interface CartState {
  items: CartItem[];
}

export interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const CART_KEY = 'catalog_cart';

export function loadCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    return raw !== null ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const CartContext = React.createContext<(CartState & CartActions) | null>(null);

export function useCart(): CartState & CartActions {
  const ctx = React.useContext(CartContext);
  if (ctx === null) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
