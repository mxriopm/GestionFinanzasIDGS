import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

interface HeaderBarProps {
  title: string;
  statusText?: string;
  icon?: React.ReactNode;
}

export default function HeaderBar({ title, statusText = 'Sesión Activa', icon }: HeaderBarProps) {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas cerrar sesión?')) await logout();
    } else {
      Alert.alert('Cerrar Sesión', '¿Deseas salir de tu cuenta?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: async () => await logout() },
      ]);
    }
  };

  return (
    <View style={styles.topBar}>
      <View style={styles.userInfo}>
        {icon && <View style={styles.avatar}>{icon}</View>}
        <View>
          <Text style={styles.welcomeText}>{title}</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.iconLogout} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  welcomeText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.success, marginRight: 6 },
  statusText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  iconLogout: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 113, 133, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.35)',
  },
});