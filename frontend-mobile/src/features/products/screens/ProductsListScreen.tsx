import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Image, Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { productsApi } from '@features/products/api';
import { useCart } from '@features/cart/context';
import type { Product } from '@features/products/models';

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: { productId: number };
};

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductsList'>;

export default function ProductsListScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { addToCart, itemCount } = useCart();

  const fetch = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
      setFiltered(data);
    } catch { /* silencioso */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)));
  }, [search, products]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#6366f1" /></View>;

  return (
    <View style={s.container}>
      <View style={s.hero}>
        <Text style={s.heroTitle}>Inventory Sales Hub</Text>
        <Text style={s.heroSub}>Tu marketplace de confianza</Text>
      </View>
      <TextInput style={s.search} placeholder="Buscar..." placeholderTextColor="#9ca3af"
        value={search} onChangeText={setSearch} />
      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={['#6366f1']} />}
        ListEmptyComponent={<Text style={s.empty}>Sin productos</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} activeOpacity={0.85}>
            {item.imageUrl
              ? <Image source={{ uri: item.imageUrl }} style={s.img} resizeMode="cover" />
              : <View style={s.imgPlaceholder}><Text style={s.imgPlaceholderText}>📦</Text></View>}
            <View style={s.cardBody}>
              <Text style={s.cat}>{item.categoryName}</Text>
              <Text style={s.name} numberOfLines={2}>{item.name}</Text>
              <Text style={s.price}>${item.price.toFixed(2)}</Text>
              <TouchableOpacity
                style={[s.addBtn, item.stock === 0 && s.addBtnOff]}
                disabled={item.stock === 0}
                onPress={() => { addToCart(item); Alert.alert('✓', `${item.name} añadido`); }}>
                <Text style={s.addBtnText}>{item.stock === 0 ? 'Sin stock' : '+ Carrito'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { backgroundColor: '#6366f1', padding: 20 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  heroSub: { fontSize: 13, color: '#c7d2fe', marginTop: 2 },
  search: { margin: 12, backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#e5e7eb', color: '#111827' },
  list: { paddingHorizontal: 10, paddingBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  card: { flex: 1, maxWidth: '48%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 },
  img: { width: '100%', height: 120 },
  imgPlaceholder: { width: '100%', height: 120, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  imgPlaceholderText: { fontSize: 32 },
  cardBody: { padding: 10 },
  cat: { fontSize: 10, color: '#6366f1', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '700', color: '#059669', marginBottom: 8 },
  addBtn: { backgroundColor: '#6366f1', borderRadius: 8, padding: 8, alignItems: 'center' },
  addBtnOff: { backgroundColor: '#e5e7eb' },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
