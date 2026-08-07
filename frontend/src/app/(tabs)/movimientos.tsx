import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MovimientosScreen() {
  const router = useRouter();
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('ingreso');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');

  // Redirección al presionar la opción de Ingreso / Presupuesto
  const handleSeleccionarTipo = (tipoSeleccionado: 'ingreso' | 'gasto') => {
    setTipo(tipoSeleccionado);
    
    if (tipoSeleccionado === 'ingreso') {
      // Redirige directamente a la pantalla de Presupuesto
      router.push('/(tabs)/presupuesto' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1d" />

      <View style={styles.header}>
        <Text style={styles.title}>Nuevo Movimiento</Text>
        <Text style={styles.subtitle}>Registra tus entradas y salidas de dinero</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Selector de Tipo de Operación */}
        <Text style={styles.label}>TIPO DE OPERACIÓN</Text>
        <View style={styles.typeSelectorRow}>
          <TouchableOpacity
            style={[styles.typeButton, tipo === 'ingreso' && styles.typeButtonIngresoActive]}
            onPress={() => handleSeleccionarTipo('ingreso')}
            activeOpacity={0.8}
          >
            <Ionicons name="wallet-outline" size={18} color={tipo === 'ingreso' ? '#10b981' : '#64748b'} />
            <Text style={[styles.typeButtonText, tipo === 'ingreso' && styles.typeTextIngresoActive]}>
              Presupuesto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, tipo === 'gasto' && styles.typeButtonGastoActive]}
            onPress={() => handleSeleccionarTipo('gasto')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={18} color={tipo === 'gasto' ? '#ef4444' : '#64748b'} />
            <Text style={[styles.typeButtonText, tipo === 'gasto' && styles.typeTextGastoActive]}>
              Gasto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Campos del Formulario */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONCEPTO / TÍTULO</Text>
          <TextInput
            placeholder="Ej. Supermercado, Sueldo, Freelance"
            placeholderTextColor="#475569"
            value={concepto}
            onChangeText={setConcepto}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>MONTO ($ MXN)</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor="#475569"
            value={monto}
            onChangeText={setMonto}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CATEGORÍA</Text>
          <TextInput
            placeholder="Ej. Comida, Servicios, Nomina"
            placeholderTextColor="#475569"
            value={categoria}
            onChangeText={setCategoria}
            style={styles.input}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1d' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 13, marginTop: 2 },
  formContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  label: { color: '#94a3b8', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  typeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  typeButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131b2e',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  typeButtonIngresoActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  typeButtonGastoActive: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  typeButtonText: { color: '#64748b', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  typeTextIngresoActive: { color: '#10b981', fontWeight: '700' },
  typeTextGastoActive: { color: '#ef4444', fontWeight: '700' },
  inputGroup: { marginBottom: 16 },
  input: {
    backgroundColor: '#131b2e',
    color: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
});