import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import api from '../../services/api';

export default function MovimientosScreen() {
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');
  const [titulo, setTitulo] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!titulo || !monto || !categoria) {
      Alert.alert('Atención', 'Por favor llena todos los campos.');
      return;
    }

    try {
      setLoading(true);
      // Petición lista para cuando el backend de tu compa esté activo
      await api.post('/transacciones', {
        titulo,
        monto: parseFloat(monto),
        tipo,
        categoria,
      });

      Alert.alert('¡Éxito!', 'Movimiento registrado correctamente');
      setTitulo('');
      setMonto('');
      setCategoria('');
    } catch (error: any) {
      Alert.alert(
        'Simulación Local', 
        'Movimiento listo en interfaz (se conectará al Backend al tener la API activa).'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nuevo Movimiento</Text>
          <Text style={styles.subtitle}>Registra tus entradas y salidas de dinero</Text>
        </View>

        {/* Tarjeta de Formulario */}
        <View style={styles.card}>
          
          {/* Selector de Tipo (Ingreso / Gasto) */}
          <Text style={styles.label}>Tipo de Operación</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[
                styles.typeButton, 
                tipo === 'ingreso' && styles.typeButtonIngresoActive
              ]}
              onPress={() => setTipo('ingreso')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.typeButtonText, 
                tipo === 'ingreso' && styles.typeButtonTextActive
              ]}>
                💰 Ingreso
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.typeButton, 
                tipo === 'gasto' && styles.typeButtonGastoActive
              ]}
              onPress={() => setTipo('gasto')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.typeButtonText, 
                tipo === 'gasto' && styles.typeButtonTextActive
              ]}>
                🛒 Gasto
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulario Inputs */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Concepto / Título</Text>
            <TextInput
              placeholder="Ej. Supermercado, Sueldo, Freelance"
              placeholderTextColor="#475569"
              value={titulo}
              onChangeText={setTitulo}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Monto ($ MXN)</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#475569"
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Categoría</Text>
            <TextInput
              placeholder="Ej. Comida, Servicios, Nomina, Servicios"
              placeholderTextColor="#475569"
              value={categoria}
              onChangeText={setCategoria}
              style={styles.input}
            />
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity 
            onPress={handleGuardar}
            disabled={loading}
            style={[
              styles.saveButton, 
              tipo === 'ingreso' ? styles.saveButtonIngreso : styles.saveButtonGasto,
              loading && { opacity: 0.7 }
            ]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Movimiento</Text>
            )}
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#090d16',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  typeButtonIngresoActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  typeButtonGastoActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  typeButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  typeButtonTextActive: {
    color: '#f8fafc',
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#090d16',
    color: '#f8fafc',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonIngreso: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveButtonGasto: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});