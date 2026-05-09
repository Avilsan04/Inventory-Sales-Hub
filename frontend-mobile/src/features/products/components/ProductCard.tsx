import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Product } from '@features/products/models';
import { useCart } from '@features/cart/context';
import { colors } from '@shared/theme/colors';
import { spacing, borderRadius } from '@shared/theme/spacing';
import { fontSize, fontWeight } from '@shared/theme/typography';

interface Props {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const { addToCart } = useCart();

  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `http://10.0.2.2:8080/uploads/products/${product.imageUrl}`
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.category}>{product.categoryName}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.addBtn, product.stock === 0 && styles.addBtnDisabled]}
          onPress={e => {
            e.stopPropagation();
            addToCart(product);
          }}
          disabled={product.stock === 0}>
          <Text style={styles.addBtnText}>
            {product.stock === 0 ? 'Sin stock' : '+ Carrito'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: '100%', height: 130 },
  placeholder: {
    width: '100%',
    height: 130,
    backgroundColor: colors.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: colors.textMuted, fontSize: fontSize.xs },
  info: { padding: spacing[2] },
  category: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing[1] },
  price: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.success, marginBottom: spacing[2] },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: colors.border },
  addBtnText: { color: colors.textInverse, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
});
