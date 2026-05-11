import { useCartStore } from '../stores/cartStore';
import type { CartState } from '../stores/cartStore';
export type { CartItem } from '../stores/cartStore';

export function useCart(): CartState {
  return useCartStore();
}
