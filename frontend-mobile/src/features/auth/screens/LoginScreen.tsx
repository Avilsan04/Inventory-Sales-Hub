import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authApi } from '@features/auth/api';
import { tokenStorage } from '@core/storage';
import { useAuth } from '@features/auth/context';
import type { AuthStackParamList } from '../router/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Rellena todos los campos');
      return;
    }
    setLoading(true);
    try {
      // 1. Login → obtenemos los tokens
      const response = await authApi.login({ email, password });
      await tokenStorage.saveToken(response.accessToken);

      // 2. Con el token ya guardado, obtenemos el perfil real del usuario
      const profile = await authApi.getMe();
      setUser({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        token: response.accessToken,
      });
    } catch {
      Alert.alert('Error', 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Inventory Sales Hub</Text>
        <Text style={styles.subtitle}>Iniciar sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#6366f1', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 24 },
  input: {
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, padding: 14, fontSize: 15, color: '#111827', marginBottom: 14,
  },
  button: {
    backgroundColor: '#6366f1', borderRadius: 10, padding: 15,
    alignItems: 'center', marginTop: 4, marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#6366f1', fontSize: 14 },
});
