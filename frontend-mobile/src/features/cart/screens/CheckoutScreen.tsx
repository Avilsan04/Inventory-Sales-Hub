import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useCart } from '@features/cart/context';
import { ordersApi } from '@features/products/api';

interface CheckoutForm {
  // Datos de envío
  nombre: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  // Datos de pago
  titular: string;
  numeroTarjeta: string;
  caducidad: string;
  cvv: string;
}

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export default function CheckoutScreen({ onBack, onSuccess }: Props) {
  const { cart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    nombre: '', direccion: '', ciudad: '', codigoPostal: '',
    titular: '', numeroTarjeta: '', caducidad: '', cvv: '',
  });
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  const update = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const formatTarjeta = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatCaducidad = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 4);
    if (nums.length >= 3) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    return nums;
  };

  const validate = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};

    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';
    if (!form.ciudad.trim()) newErrors.ciudad = 'La ciudad es obligatoria';
    if (!/^\d{4,5}$/.test(form.codigoPostal)) newErrors.codigoPostal = 'Código postal no válido';

    if (!form.titular.trim()) newErrors.titular = 'El titular es obligatorio';
    const cardNums = form.numeroTarjeta.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNums)) newErrors.numeroTarjeta = 'Número de tarjeta no válido (16 dígitos)';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.caducidad)) newErrors.caducidad = 'Formato MM/AA';
    if (!/^\d{3,4}$/.test(form.cvv)) newErrors.cvv = 'CVV no válido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await ordersApi.create({
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
      });
      clearCart();
      onSuccess();
    } catch {
      Alert.alert('Error', 'No se pudo procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Cabecera */}
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Text style={s.backText}>← Volver al carrito</Text>
        </TouchableOpacity>
        <Text style={s.title}>Finalizar compra</Text>

        {/* Resumen */}
        <View style={s.resumen}>
          <Text style={s.resumenLabel}>{cart.length} artículo{cart.length !== 1 ? 's' : ''}</Text>
          <Text style={s.resumenTotal}>Total: ${total.toFixed(2)}</Text>
        </View>

        {/* Datos de envío */}
        <Text style={s.sectionTitle}>📦 Datos de envío</Text>

        <Text style={s.label}>Nombre completo</Text>
        <TextInput style={[s.input, errors.nombre && s.inputError]}
          placeholder="Juan García" placeholderTextColor="#9ca3af"
          value={form.nombre} onChangeText={v => update('nombre', v)} />
        {errors.nombre ? <Text style={s.error}>{errors.nombre}</Text> : null}

        <Text style={s.label}>Dirección</Text>
        <TextInput style={[s.input, errors.direccion && s.inputError]}
          placeholder="Calle Mayor 12, 3º A" placeholderTextColor="#9ca3af"
          value={form.direccion} onChangeText={v => update('direccion', v)} />
        {errors.direccion ? <Text style={s.error}>{errors.direccion}</Text> : null}

        <View style={s.row}>
          <View style={s.rowHalf}>
            <Text style={s.label}>Ciudad</Text>
            <TextInput style={[s.input, errors.ciudad && s.inputError]}
              placeholder="Madrid" placeholderTextColor="#9ca3af"
              value={form.ciudad} onChangeText={v => update('ciudad', v)} />
            {errors.ciudad ? <Text style={s.error}>{errors.ciudad}</Text> : null}
          </View>
          <View style={s.rowHalf}>
            <Text style={s.label}>Código postal</Text>
            <TextInput style={[s.input, errors.codigoPostal && s.inputError]}
              placeholder="28001" placeholderTextColor="#9ca3af"
              value={form.codigoPostal} onChangeText={v => update('codigoPostal', v)}
              keyboardType="numeric" maxLength={5} />
            {errors.codigoPostal ? <Text style={s.error}>{errors.codigoPostal}</Text> : null}
          </View>
        </View>

        {/* Datos de pago */}
        <Text style={s.sectionTitle}>💳 Datos de pago</Text>

        <Text style={s.label}>Titular de la tarjeta</Text>
        <TextInput style={[s.input, errors.titular && s.inputError]}
          placeholder="JUAN GARCIA" placeholderTextColor="#9ca3af"
          value={form.titular} onChangeText={v => update('titular', v.toUpperCase())}
          autoCapitalize="characters" />
        {errors.titular ? <Text style={s.error}>{errors.titular}</Text> : null}

        <Text style={s.label}>Número de tarjeta</Text>
        <TextInput style={[s.input, errors.numeroTarjeta && s.inputError]}
          placeholder="1234 5678 9012 3456" placeholderTextColor="#9ca3af"
          value={form.numeroTarjeta}
          onChangeText={v => update('numeroTarjeta', formatTarjeta(v))}
          keyboardType="numeric" maxLength={19} />
        {errors.numeroTarjeta ? <Text style={s.error}>{errors.numeroTarjeta}</Text> : null}

        <View style={s.row}>
          <View style={s.rowHalf}>
            <Text style={s.label}>Caducidad</Text>
            <TextInput style={[s.input, errors.caducidad && s.inputError]}
              placeholder="MM/AA" placeholderTextColor="#9ca3af"
              value={form.caducidad}
              onChangeText={v => update('caducidad', formatCaducidad(v))}
              keyboardType="numeric" maxLength={5} />
            {errors.caducidad ? <Text style={s.error}>{errors.caducidad}</Text> : null}
          </View>
          <View style={s.rowHalf}>
            <Text style={s.label}>CVV</Text>
            <TextInput style={[s.input, errors.cvv && s.inputError]}
              placeholder="123" placeholderTextColor="#9ca3af"
              value={form.cvv} onChangeText={v => update('cvv', v.replace(/\D/g, ''))}
              keyboardType="numeric" maxLength={4} secureTextEntry />
            {errors.cvv ? <Text style={s.error}>{errors.cvv}</Text> : null}
          </View>
        </View>

        {/* Botón confirmar */}
        <TouchableOpacity style={s.btn} onPress={handleConfirm} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Confirmar pedido — ${total.toFixed(2)}</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scroll: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#6366f1', fontSize: 14 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  resumen: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#eef2ff', borderRadius: 10, padding: 12, marginBottom: 24 },
  resumenLabel: { color: '#6366f1', fontSize: 14 },
  resumenTotal: { color: '#6366f1', fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
  label: { fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#111827', marginBottom: 4 },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  rowHalf: { flex: 1 },
  btn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
