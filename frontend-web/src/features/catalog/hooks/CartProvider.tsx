import * as React from 'react';
import { CartContext, loadCart, saveCart } from './useCart';
import type { CartItem } from './useCart';

export function CartProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [items, setItems] = React.useState<CartItem[]>(loadCart);

  const addItem = React.useCallback((item: Omit<CartItem, 'quantity'>): void => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      let next: CartItem[];
      if (existing !== undefined) {
        next = prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock) }
            : i
        );
      } else {
        next = [...prev, { ...item, quantity: 1 }];
      }
      saveCart(next);
      return next;
    });
  }, []);

  const removeItem = React.useCallback((productId: string): void => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = React.useCallback((productId: string, quantity: number): void => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
          : i
      );
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = React.useCallback((): void => {
    setItems([]);
    saveCart([]);
  }, []);

  const value = React.useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart }),
    [items, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
