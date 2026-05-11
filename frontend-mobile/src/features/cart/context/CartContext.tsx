import React, { createContext, useContext, useState } from 'react';
import type { Product, CartItem } from '@features/products/models';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) =>
    setCart(prev => {
      const found = prev.find(i => i.id === product.id);
      if (found) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));
  const increaseQty = (id: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const decreaseQty = (id: number) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0)
  );
  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const itemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
