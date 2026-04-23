import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { productsApi } from '@features/products/api';
import { useCart } from '@features/cart/context';
import type { Product } from '@features/products/models';
import type { ProductsStackParamList } from './ProductsListScreen';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen({ route }: Props) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    productsApi.getById(productId)
      .then(setProduct)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el producto'))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#6366f1" /></View>;
  if (!product) return null;

  return (
    <ScrollView style={s.container}>
      {product.imageUrl
        ? <Image source={{ uri: product.imageUrl }} style={s.img} resizeMode="cover" />
        : <View style={s.imgPlaceholder}><Text style={{ fontSize: 64 }}>📦</Text></View>}
      <View style={s.body}>
        <Text style={s.cat}>{product.categoryName}</Text>
        <Text style={s.name}>{product.name}</Text>
        <Text style={s.price}>${product.price.toFixed(2)}</Text>
        <Text style={s.stock}>Stock: {product.stock} unidades</Text>
        <Text style={s.descTitle}>Descripción</Text>
        <Text style={s.desc}>{product.description || 'Sin descripción'}</Text>
        <TouchableOpacity
          style={[s.btn, product.stock === 0 && s.btnOff]}
          disabled={product.stock === 0}
          onPress={() => { addToCart(product); Alert.alert('✓ Añadido', `${product.name} está en tu carrito`); }}>
          <Text style={s.btnText}>{product.stock === 0 ? 'Sin stock' : 'Añadir al carrito'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  img: { width: '100%', height: 260 },
  imgPlaceholder: { width: '100%', height: 260, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  body: { padding: 20 },
  cat: { fontSize: 12, color: '#6366f1', fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
  name: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  price: { fontSize: 22, fontWeight: '700', color: '#059669', marginBottom: 8 },
  stock: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  descTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 6 },
  desc: { fontSize: 14, color: '#6b7280', lineHeight: 22, marginBottom: 28 },
  btn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnOff: { backgroundColor: '#d1d5db' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
