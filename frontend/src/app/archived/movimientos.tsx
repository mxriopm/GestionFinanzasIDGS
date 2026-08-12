import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import BackgroundAnimated from '../../components/BackgroundAnimated';
import { COLORS, globalStyles } from '../../constants/theme';

const CATEGORIAS_RAPIDAS_MOVIMIENTOS = [
  { nombre: 'Comida', icon: 'fast-food-outline', color: '#f59e0b' },
  { nombre: 'Nómina', icon: 'cash-outline', color: '#10b981' },
  { nombre: 'Transporte', icon: 'car-outline', color: '#0ea5e9' },
  { nombre: 'Servicios', icon: 'flash-outline', color: '#eab308' },
  { nombre: 'Compras', icon: 'cart-outline', color: '#ec4899' },
  { nombre: 'Inversiones', icon: 'trending-up-outline', color: '#8b5cf6' },
];

export default function MovimientosScreen() {
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Animaciones de Entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleGuardar = async () => {
    const montoNum = parseFloat(monto);

    if (isNaN(montoNum) || montoNum <= 0) {
      const msg = 'Ingresa un monto válido mayor a $0';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Monto requerido', msg);
      return;
    }

    if (!concepto.trim()) {
      const msg = 'Escribe un concepto o descripción para la operación';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Campo requerido', msg);
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = tipo === 'gasto' ? '/gastos' : '/ingresos';
      const catFinal = categoria.trim() || (tipo === 'gasto' ? 'General' : 'Otros');
      const fechaActual = new Date();

      const payload = tipo === 'gasto' 
        ? {
            monto: montoNum,
            categoria: catFinal,
            descripcion: concepto.trim()
          }
        : {
            monto: montoNum,
            categoria: catFinal,
            concepto: concepto.trim(),
            descripcion: concepto.trim(),
            mes: fechaActual.getMonth() + 1,
            año: fechaActual.getFullYear()
          };

      await api.post(endpoint, payload);

      const msg = `¡${tipo === 'gasto' ? 'Gasto' : 'Ingreso'} registrado con éxito!`;
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Éxito', msg);

      setMonto('');
      setConcepto('');
      setCategoria('');
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al guardar la operación';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BackgroundAnimated>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header Superior */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBadge}>
                <MaterialCommunityIcons name="swap-horizontal-bold" size={22} color={COLORS.primary} />
              </View>
              <View>
                <Text style={globalStyles.titleModern}>Nueva Operación</Text>
                <Text style={styles.subtitle}>Gestión en tiempo real de tu flujo de efectivo</Text>
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            
            {/* Segmented Control solo cambia el estado local sin redirecciones */}
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  tipo === 'gasto' && styles.segmentGastoActive,
                ]}
                onPress={() => setTipo('gasto')}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={18}
                  color={tipo === 'gasto' ? '#ffffff' : COLORS.textMuted}
                />
                <Text style={[styles.segmentText, tipo === 'gasto' && styles.segmentTextActive]}>
                  Gasto / Salida
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  tipo === 'ingreso' && styles.segmentIngresoActive,
                ]}
                onPress={() => setTipo('ingreso')}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={18}
                  color={tipo === 'ingreso' ? '#ffffff' : COLORS.textMuted}
                />
                <Text style={[styles.segmentText, tipo === 'ingreso' && styles.segmentTextActive]}>
                  Ingreso / Meta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tarjeta Principal Formulario */}
            <View style={globalStyles.cardGlass}>
              
              {/* Campo de Monto Destacado */}
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Monto de la Operación</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={[styles.currencySymbol, { color: tipo === 'gasto' ? COLORS.danger : COLORS.success }]}>
                    $
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textMuted}
                    value={monto}
                    onChangeText={setMonto}
                    keyboardType="numeric"
                    style={styles.amountInput}
                  />
                  <Text style={styles.currencyCode}>MXN</Text>
                </View>
              </View>

              {/* Categorías Rápidas */}
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Categorías Frecuentes</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
                  {CATEGORIAS_RAPIDAS_MOVIMIENTOS.map((cat) => {
                    const isSelected = categoria.toLowerCase() === cat.nombre.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={cat.nombre}
                        style={[
                          styles.chipCategory,
                          isSelected && { backgroundColor: `${cat.color}30`, borderColor: cat.color },
                        ]}
                        onPress={() => setCategoria(cat.nombre)}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={15}
                          color={isSelected ? cat.color : COLORS.textMuted}
                        />
                        <Text style={[styles.chipText, isSelected && { color: COLORS.textPrimary, fontWeight: '700' }]}>
                          {cat.nombre}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Concepto / Título */}
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Concepto / Descripción</Text>
                <TextInput
                  placeholder="Ej. Pago de despensa, Honorarios..."
                  placeholderTextColor={COLORS.textMuted}
                  value={concepto}
                  onChangeText={setConcepto}
                  style={globalStyles.inputGlass}
                />
              </View>

              {/* Categoría Manual */}
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Categoría Personalizada</Text>
                <TextInput
                  placeholder="Escribe una categoría si no está en la lista..."
                  placeholderTextColor={COLORS.textMuted}
                  value={categoria}
                  onChangeText={setCategoria}
                  style={globalStyles.inputGlass}
                />
              </View>

              {/* Botón Principal */}
              <TouchableOpacity
                style={[
                  globalStyles.btnPrimary,
                  { backgroundColor: tipo === 'gasto' ? COLORS.danger : COLORS.success },
                  { marginTop: 8 },
                  submitting && { opacity: 0.7 }
                ]}
                onPress={handleGuardar}
                disabled={submitting}
                activeOpacity={0.88}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="check-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={globalStyles.btnPrimaryText}>
                      {tipo === 'gasto' ? 'REGISTRAR GASTO' : 'REGISTRAR INGRESO'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </BackgroundAnimated>
  );
}

const styles = StyleSheet.create({
  animatedContainer: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2, fontWeight: '500' },
  formContainer: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 40 },
  
  // Segmented Control
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  segmentGastoActive: {
    backgroundColor: COLORS.danger,
  },
  segmentIngresoActive: {
    backgroundColor: COLORS.success,
  },
  segmentText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginLeft: 6 },
  segmentTextActive: { color: '#ffffff', fontWeight: '800' },

  // Monto Input Destacado
  inputGroup: { marginBottom: 18 },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  currencySymbol: { fontSize: 26, fontWeight: '900', marginRight: 8 },
  amountInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 10,
  },
  currencyCode: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },

  // Categorías
  categoriesRow: { flexDirection: 'row', marginBottom: 4 },
  chipCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  chipText: { color: COLORS.textSecondary, fontSize: 12, marginLeft: 6 },
});