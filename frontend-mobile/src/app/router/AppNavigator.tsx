import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@features/auth/context';
import { useCart } from '@features/cart/context';
import AuthNavigator from '@features/auth/router/AuthNavigator';
import ProductsNavigator from '@features/products/router/ProductsNavigator';
import CartScreen from '@features/cart/screens/CartScreen';
import OrdersScreen from '@features/orders/screens/OrdersScreen';
import ProfileScreen from '@features/profile/screens/ProfileScreen';

type RootStackParamList = { Auth: undefined; Main: undefined };
type MainTabParamList = { Inicio: undefined; Carrito: undefined; Pedidos: undefined; Perfil: undefined };

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { itemCount } = useCart();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopColor: '#e5e7eb' },
        headerShown: false,
      }}>
      <Tab.Screen
        name="Inicio"
        component={ProductsNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }}
      />
      <Tab.Screen
        name="Carrito"
        component={CartScreen}
        options={{
          headerShown: true,
          title: 'Carrito',
          tabBarIcon: ({ focused }) => <TabIcon icon="🛒" focused={focused} />,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={OrdersScreen}
        options={{
          headerShown: true,
          title: 'Mis pedidos',
          tabBarIcon: ({ focused }) => <TabIcon icon="🧾" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Mi perfil',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={{ opacity: focused ? 1 : 0.45 }}>
      <ActivityIndicator style={{ display: 'none' }} />
      {/* React Native no permite Text directamente en tabBarIcon sin View */}
      <View><TabEmoji icon={icon} /></View>
    </View>
  );
}

// Pequeño truco para emojis en tabs sin react-native-vector-icons
import { Text } from 'react-native';
function TabEmoji({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 22 }}>{icon}</Text>;
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated
          ? <RootStack.Screen name="Main" component={MainTabs} />
          : <RootStack.Screen name="Auth" component={AuthNavigator} />}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
