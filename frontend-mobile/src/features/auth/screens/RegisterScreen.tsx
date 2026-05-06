import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authApi } from '@features/auth/api';
import { tokenStorage } from '@core/storage';
import { useAuth } from '@features/auth/context';
import type { AuthStackParamList } from '../router/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setUser } = useAuth();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) newErrors.username = 'El nombre de usuario es obligatorio';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Introduce un email válido';
    }
    if (password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(password)) newErrors.password = 'Debe contener al menos una mayúscula';
    if (!/[0-9]/.test(password)) newErrors.password = 'Debe contener al menos un número';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authApi.register({ username, email, password });
      await tokenStorage.saveToken(response.accessToken);
      setUser({ id: response.id, username: response.username, email: response.email, token: response.accessToken });
    } catch {
      Alert.alert('Error', 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.card}>
          <Text style={s.title}>Inventory Sales Hub</Text>
          <Text style={s.subtitle}>Crear cuenta</Text>

          <TextInput style={[s.input, errors.username && s.inputError]}
            placeholder="Nombre de usuario" placeholderTextColor="#9ca3af"
            value={username} onChangeText={setUsername} />
          {errors.username ? <Text style={s.error}>{errors.username}</Text> : null}

          <TextInput style={[s.input, errors.email && s.inputError]}
            placeholder="Email" placeholderTextColor="#9ca3af"
            value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" />
          {errors.email ? <Text style={s.error}>{errors.email}</Text> : null}

          <TextInput style={[s.input, errors.password && s.inputError]}
            placeholder="Contraseña (mín. 8 caracteres, 1 mayúscula, 1 número)"
            placeholderTextColor="#9ca3af"
            value={password} onChangeText={setPassword} secureTextEntry />
          {errors.password ? <Text style={s.error}>{errors.password}</Text> : null}

          <TextInput style={[s.input, errors.confirmPassword && s.inputError]}
            placeholder="Confirmar contraseña" placeholderTextColor="#9ca3af"
            value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          {errors.confirmPassword ? <Text style={s.error}>{errors.confirmPassword}</Text> : null}

          <TouchableOpacity style={s.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Registrarse</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={s.link}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#6366f1', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, padding: 14, fontSize: 15, color: '#111827', marginBottom: 4 },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', fontSize: 12, marginBottom: 8 },
  button: { backgroundColor: '#6366f1', borderRadius: 10, padding: 15,
    alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#6366f1', fontSize: 14 },
});
