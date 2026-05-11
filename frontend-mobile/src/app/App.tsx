import React from 'react';
import { AuthProvider } from '@features/auth/context';
import { CartProvider } from '@features/cart/context';
import AppNavigator from './router/AppNavigator';

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
