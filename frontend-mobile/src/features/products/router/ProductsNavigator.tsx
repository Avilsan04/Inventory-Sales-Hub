import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsListScreen, { type ProductsStackParamList } from '../screens/ProductsListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export default function ProductsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductsList" component={ProductsListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalle del producto' }} />
    </Stack.Navigator>
  );
}
