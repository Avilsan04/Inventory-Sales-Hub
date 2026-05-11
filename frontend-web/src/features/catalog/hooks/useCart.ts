import { useCartStore } from '@features/sales';

/** Catalog-facing CartItem shape (name/price instead of productName/unitPrice). */
export interface CartItem {
  productId: string;
  sku: string;
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

/**
 * Catalog adapter over the unified Zustand cart store.
 * Translates between the catalog's (name/price) interface and
 * the store's (productName/unitPrice) interface so catalog components
 * need no changes.
 */
export function useCart(): CartState & CartActions {
  const store = useCartStore();

  const items: CartItem[] = store.items.map((i) => ({
    productId: i.productId,
    sku: i.sku,
    name: i.productName,
    price: i.unitPrice,
    currency: i.currency,
    quantity: i.quantity,
    maxStock: i.maxStock,
  }));

  const addItem = (item: Omit<CartItem, 'quantity'>): void => {
    store.addItem({
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      unitPrice: item.price,
      currency: item.currency,
      maxStock: item.maxStock,
    });
  };

  const updateQuantity = (productId: string, quantity: number): void => {
    const current = store.items.find((i) => i.productId === productId);
    const delta = quantity - (current?.quantity ?? 0);
    if (delta !== 0) store.changeQty(productId, delta);
  };

  return {
    items,
    addItem,
    removeItem: store.removeItem,
    updateQuantity,
    clearCart: store.clearCart,
  };
}
