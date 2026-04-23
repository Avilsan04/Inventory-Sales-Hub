import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useCart } from '@features/cart/context';
import { ordersApi } from '@features/products/api';

export default function CartScreen() {
  const { cart, removeFromCart, increaseQty, decreaseQty, clearCart, total, itemCount } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    Alert.alert('Confirmar pedido', `Total: $${total.toFixed(2)}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar', onPress: async () => {
          setLoading(true);
          try {
            await ordersApi.create({ items: cart.map(i => ({ productId: i.id, quantity: i.quantity })) });
            clearCart();
            Alert.alert('✓ Pedido realizado', 'Tu pedido se ha procesado correctamente');
          } catch {
            Alert.alert('Error', 'No se pudo procesar el pedido');
          } finally { setLoading(false); }
        },
      },
    ]);
  };

  if (cart.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text style={s.emptyText}>Tu carrito está vacío</Text>
        <Text style={s.emptySub}>Añade productos desde el catálogo</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={cart}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <View style={s.item}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={s.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              <Text style={s.itemUnit}>${item.price.toFixed(2)} / ud.</Text>
            </View>
            <View style={s.controls}>
              <TouchableOpacity style={s.ctrl} onPress={() => decreaseQty(item.id)}><Text style={s.ctrlTxt}>−</Text></TouchableOpacity>
              <Text style={s.qty}>{item.quantity}</Text>
              <TouchableOpacity style={s.ctrl} onPress={() => increaseQty(item.id)}><Text style={s.ctrlTxt}>+</Text></TouchableOpacity>
              <TouchableOpacity style={s.del} onPress={() => removeFromCart(item.id)}><Text>🗑</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={s.footer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={s.totalLabel}>{itemCount} artículo{itemCount !== 1 ? 's' : ''}</Text>
          <Text style={s.total}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={s.btn} onPress={handleCheckout} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Realizar pedido</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#9ca3af' },
  list: { padding: 14 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#059669' },
  itemUnit: { fontSize: 11, color: '#9ca3af' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctrl: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  ctrlTxt: { fontSize: 16, color: '#6366f1', fontWeight: '700' },
  qty: { fontSize: 15, fontWeight: '700', color: '#111827', minWidth: 20, textAlign: 'center' },
  del: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  totalLabel: { fontSize: 15, color: '#6b7280' },
  total: { fontSize: 20, fontWeight: '700', color: '#111827' },
  btn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
