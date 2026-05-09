import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@features/auth/context';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return null;

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.name}>{user.username}</Text>
        <Text style={s.email}>{user.email}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Información de cuenta</Text>

        <View style={s.row}>
          <Text style={s.rowIcon}>👤</Text>
          <View>
            <Text style={s.rowLabel}>Usuario</Text>
            <Text style={s.rowValue}>{user.username}</Text>
          </View>
        </View>

        <View style={s.row}>
          <Text style={s.rowIcon}>✉️</Text>
          <View>
            <Text style={s.rowLabel}>Email</Text>
            <Text style={s.rowValue}>{user.email}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#6366f1', paddingVertical: 40, alignItems: 'center', gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#6366f1' },
  name: { fontSize: 22, fontWeight: '700', color: '#fff' },
  email: { fontSize: 14, color: '#c7d2fe' },
  section: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowIcon: { fontSize: 20 },
  rowLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 2 },
  rowValue: { fontSize: 15, color: '#111827', fontWeight: '500' },
  logoutBtn: { margin: 16, marginTop: 4, backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
