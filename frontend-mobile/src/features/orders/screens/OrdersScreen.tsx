import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { ordersApi } from '@features/products/api';
import { useAuth } from '@features/auth/context';
import type { OrderResponse } from '@features/products/models';

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  color: '#d97706' },
  CONFIRMED: { label: 'Confirmado', color: '#2563eb' },
  DELIVERED: { label: 'Entregado',  color: '#16a34a' },
  CANCELLED: { label: 'Cancelado',  color: '#dc2626' },
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    if (!user) return;
    try { setOrders(await ordersApi.getByUser(user.id)); }
    catch { /* silencioso */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#6366f1" /></View>;
  if (orders.length === 0) return (
    <View style={s.empty}>
      <Text style={{ fontSize: 64 }}>🧾</Text>
      <Text style={s.emptyText}>No tienes pedidos aún</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <FlatList
        data={orders}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={['#6366f1']} />}
        renderItem={({ item }) => {
          const st = STATUS[item.status] ?? { label: item.status, color: '#94a3b8' };
          return (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.orderId}>Pedido #{item.id}</Text>
                <View style={[s.badge, { backgroundColor: st.color + '20' }]}>
                  <Text style={[s.badgeTxt, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={s.divider} />
              {item.items.map((oi, idx) => (
                <View key={idx} style={s.row}>
                  <Text style={s.rowName} numberOfLines={1}>{oi.productName}</Text>
                  <Text style={s.rowQty}>x{oi.quantity}</Text>
                  <Text style={s.rowPrice}>${(oi.price * oi.quantity).toFixed(2)}</Text>
                </View>
              ))}
              <View style={s.divider} />
              <View style={s.cardFooter}>
                <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString('es-ES')}</Text>
                <Text style={s.total}>Total: ${item.total.toFixed(2)}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 12 },
  list: { padding: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 15, fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowName: { flex: 1, fontSize: 13, color: '#374151' },
  rowQty: { fontSize: 13, color: '#6b7280', marginHorizontal: 8 },
  rowPrice: { fontSize: 13, fontWeight: '600', color: '#111827' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: '#9ca3af' },
  total: { fontSize: 15, fontWeight: '700', color: '#059669' },
});
