import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Animated
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';
import HeaderBar from '../../components/HeaderBar';
import BalanceCard from '../../components/BalanceCard';
import BackgroundAnimated from '../../components/BackgroundAnimated';
import { COLORS, globalStyles } from '../../constants/theme';

interface Presupuesto {
  _id: string;
  nombre?: string;
  concepto?: string;
  montoObjetivo: number;
  montoAhorrado: number;
  fechaLimite: string;
  frecuenciaAhorro: 'semanal' | 'quincenal' | 'mensual';
}

export default function PresupuestoScreen() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal para Crear Presupuesto
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [fechaObj, setFechaObj] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Default a 30 días
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frecuenciaAhorro, setFrecuenciaAhorro] = useState<'semanal' | 'quincenal' | 'mensual'>('mensual');
  const [submitting, setSubmitting] = useState(false);

  // Modal para Abonar Dinero a una Meta Especifica
  const [modalAbonoVisible, setModalAbonoVisible] = useState(false);
  const [metaSeleccionada, setMetaSeleccionada] = useState<Presupuesto | null>(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [submittingAbono, setSubmittingAbono] = useState(false);

  // Animación de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  const cargarPresupuestos = useCallback(async () => {
    try {
      const res = await api.get('/presupuestos');
      const lista = res.data.presupuestos || res.data || [];
      setPresupuestos(lista);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'No se pudieron cargar los presupuestos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarPresupuestos();
  }, [cargarPresupuestos]);

  // Atajos rápidos para cálculo automático de Fecha Límite
  const aplicarAtajoFecha = (meses: number) => {
    const nuevaFecha = new Date();
    nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
    setFechaObj(nuevaFecha);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFechaObj(selectedDate);
    }
  };

  const handleCrearPresupuesto = async () => {
    const montoNum = parseFloat(montoObjetivo);

    if (!nombre.trim()) {
      const msg = 'Ingresa un nombre para la meta u objetivo';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Campo requerido', msg);
      return;
    }

    if (isNaN(montoNum) || montoNum <= 0) {
      const msg = 'Ingresa un monto objetivo válido mayor a $0';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Monto requerido', msg);
      return;
    }

    try {
      setSubmitting(true);
      const fechaFormatted = fechaObj.toISOString().split('T')[0];

      const payload = {
        nombre: nombre.trim(),
        concepto: nombre.trim(),
        montoObjetivo: montoNum,
        fechaLimite: fechaFormatted,
        frecuenciaAhorro,
      };

      await api.post('/presupuestos', payload);

      setNombre('');
      setMontoObjetivo('');
      setFechaObj(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      setModalVisible(false);
      cargarPresupuestos();

      const msg = 'Meta de ahorro creada con éxito';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Éxito', msg);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al guardar el presupuesto';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbrirAbono = (item: Presupuesto) => {
    setMetaSeleccionada(item);
    setMontoAbono('');
    setModalAbonoVisible(true);
  };

  const handleGuardarAbono = async () => {
    if (!metaSeleccionada) return;

    const abonoNum = parseFloat(montoAbono);
    if (isNaN(abonoNum) || abonoNum <= 0) {
      const msg = 'Ingresa un monto válido mayor a $0';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Monto requerido', msg);
      return;
    }

    try {
      setSubmittingAbono(true);

      await api.post('/aportaciones', {
        presupuesto: metaSeleccionada._id,
        monto: abonoNum,
        concepto: `Abono a ${metaSeleccionada.nombre || metaSeleccionada.concepto}`
      });

      setModalAbonoVisible(false);
      setMetaSeleccionada(null);
      setMontoAbono('');
      cargarPresupuestos();

      const msg = '¡Abono registrado con éxito!';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('¡Meta Actualizada!', msg);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al guardar el abono';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSubmittingAbono(false);
    }
  };

  const handleEliminarPresupuesto = (id: string, itemNombre: string) => {
    const borrar = async () => {
      try {
        await api.delete(`/presupuestos/_id/${id}`);
        setPresupuestos((prev) => prev.filter((p) => p._id !== id));
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Error al borrar el presupuesto';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`¿Deseas eliminar "${itemNombre}"?`)) borrar();
    } else {
      Alert.alert('Eliminar Meta', `¿Deseas borrar "${itemNombre}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: borrar },
      ]);
    }
  };

  const formatMoneda = (cant: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cant || 0);

  const formatFecha = (fStr: string) => {
    if (!fStr) return '';
    return new Date(fStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalObjetivo = presupuestos.reduce((acc, curr) => acc + (Number(curr.montoObjetivo) || 0), 0);
  const totalAhorrado = presupuestos.reduce((acc, curr) => acc + (Number(curr.montoAhorrado) || 0), 0);

  const renderPresupuestoCard = ({ item }: { item: Presupuesto }) => {
    const ahorrado = item.montoAhorrado || 0;
    const porcentaje = Math.min(Math.round((ahorrado / item.montoObjetivo) * 100), 100) || 0;
    const titulo = item.nombre || item.concepto || 'Meta de Ahorro';

    return (
      <View style={[globalStyles.cardGlass, styles.cardSeparada]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.targetIcon}>
              <Feather name="target" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardNombre}>{titulo}</Text>
              <Text style={styles.cardSubtext}>
                Límite: {formatFecha(item.fechaLimite)} • {item.frecuenciaAhorro.toUpperCase()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleEliminarPresupuesto(item._id, titulo)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.deleteBtn}
          >
            <Feather name="trash-2" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.amountsRow}>
          <View>
            <Text style={styles.amountLabel}>Monto Ahorrado</Text>
            <Text style={styles.amountValueAhorrado}>{formatMoneda(ahorrado)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amountLabel}>Meta Objetivo</Text>
            <Text style={styles.amountValueObjetivo}>{formatMoneda(item.montoObjetivo)}</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${porcentaje}%` }]} />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.porcentajeText}>{porcentaje}% completado</Text>
          <Text style={styles.restanteText}>
            Faltan {formatMoneda(Math.max(item.montoObjetivo - ahorrado, 0))}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnAbonar}
          onPress={() => handleAbrirAbono(item)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.btnAbonarText}>ABONAR DINERO A ESTA META</Text>
        </TouchableOpacity>
      </View>
    );
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
          <HeaderBar
            title="Presupuestos y Metas"
            statusText="Planificación Financiera"
            icon={<MaterialCommunityIcons name="piggy-bank-outline" size={22} color={COLORS.primary} />}
          />

          <BalanceCard
            label="PROGRESO GENERAL DE METAS"
            amount={totalAhorrado}
            amountColor={COLORS.primary}
            countText={`${presupuestos.length} metas activas`}
            syncText={`Meta Total: ${formatMoneda(totalObjetivo)}`}
            icon={<Feather name="trending-up" size={22} color={COLORS.primary} />}
          />

          <View style={styles.listContainer}>
            <Text style={styles.sectionHeaderTitle}>Mis Metas de Ahorro</Text>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <FlatList
                data={presupuestos}
                keyExtractor={(item) => item._id}
                renderItem={renderPresupuestoCard}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={cargarPresupuestos} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                  <View style={styles.centerContainer}>
                    <Feather name="compass" size={48} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>Sin metas registradas</Text>
                    <Text style={styles.emptySubtext}>Crea tu primer presupuesto o meta de ahorro presionando (+).</Text>
                  </View>
                }
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.88}
          >
            <Feather name="plus" size={28} color="#ffffff" />
          </TouchableOpacity>

          {/* MODAL 1: Crear Nueva Meta */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalOverlay}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Feather name="plus-circle" size={22} color={COLORS.primary} />
                    <Text style={styles.modalTitle}> Nueva Meta de Ahorro</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Feather name="x" size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.inputGroup}>
                    <Text style={globalStyles.label}>Nombre de la Meta</Text>
                    <TextInput
                      placeholder="Ej. Fondo de Emergencia, Viaje, Casa"
                      placeholderTextColor={COLORS.textMuted}
                      value={nombre}
                      onChangeText={setNombre}
                      style={globalStyles.inputGlass}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={globalStyles.label}>Monto Objetivo ($ MXN)</Text>
                    <View style={styles.inputWithIcon}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        placeholder="0.00"
                        placeholderTextColor={COLORS.textMuted}
                        value={montoObjetivo}
                        onChangeText={setMontoObjetivo}
                        keyboardType="numeric"
                        style={[globalStyles.inputGlass, { flex: 1, fontSize: 18, fontWeight: '700', borderWidth: 0 }]}
                      />
                    </View>
                  </View>

                  {/* NUEVA SECCIÓN: Selector de Fecha Límite con Atajos Rápidos y Botón de Calendario */}
                  <View style={styles.inputGroup}>
                    <Text style={globalStyles.label}>Fecha Límite</Text>

                    {/* Atajos Rápidos de Plazos */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shortcutsRow}>
                      {[
                        { label: '+1 Mes', meses: 1 },
                        { label: '+3 Meses', meses: 3 },
                        { label: '+6 Meses', meses: 6 },
                        { label: '+1 Año', meses: 12 },
                      ].map((atajo) => (
                        <TouchableOpacity
                          key={atajo.label}
                          style={styles.chipShortcut}
                          onPress={() => aplicarAtajoFecha(atajo.meses)}
                        >
                          <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                          <Text style={styles.chipShortcutText}>{atajo.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Selector Interactivo de Fecha */}
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={fechaObj.toISOString().split('T')[0]}
                        onChange={(e) => {
                          if (e.target.value) setFechaObj(new Date(e.target.value));
                        }}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          padding: '14px 16px',
                          borderRadius: '14px',
                          border: '1px solid #38bdf8',
                          fontSize: '15px',
                          fontWeight: '600',
                          width: '100%',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.dateSelectorButton}
                          onPress={() => setShowDatePicker(true)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.calendarIconBadge}>
                            <Feather name="calendar" size={20} color={COLORS.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dateSelectorLabel}>LÍMITE SELECCIONADO</Text>
                            <Text style={styles.dateSelectorText}>
                              {fechaObj.toLocaleDateString('es-MX', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        {showDatePicker && (
                          <DateTimePicker
                            value={fechaObj}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            minimumDate={new Date()}
                            onChange={handleDateChange}
                          />
                        )}
                      </>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={globalStyles.label}>Frecuencia de Ahorro</Text>
                    <View style={styles.frecuenciaRow}>
                      {(['semanal', 'quincenal', 'mensual'] as const).map((frec) => (
                        <TouchableOpacity
                          key={frec}
                          style={[
                            styles.chipFrecuencia,
                            frecuenciaAhorro === frec && styles.chipFrecuenciaActive,
                          ]}
                          onPress={() => setFrecuenciaAhorro(frec)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              frecuenciaAhorro === frec && styles.chipTextActive,
                            ]}
                          >
                            {frec.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[globalStyles.btnPrimary, submitting && { opacity: 0.7 }, { marginTop: 10 }]}
                    onPress={handleCrearPresupuesto}
                    disabled={submitting}
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="check-circle" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text style={globalStyles.btnPrimaryText}>Guardar Meta</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* MODAL 2: Abonar Dinero */}
          <Modal
            visible={modalAbonoVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setModalAbonoVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalOverlay}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Ionicons name="wallet-outline" size={22} color={COLORS.success} />
                    <Text style={styles.modalTitle}> Abonar a Meta</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalAbonoVisible(false)} style={styles.closeBtn}>
                    <Feather name="x" size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {metaSeleccionada && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' }}>
                      {metaSeleccionada.nombre || metaSeleccionada.concepto}
                    </Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>
                      Ahorrado actual: {formatMoneda(metaSeleccionada.montoAhorrado || 0)} / {formatMoneda(metaSeleccionada.montoObjetivo)}
                    </Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>Monto a Abonar ($ MXN)</Text>
                  <View style={styles.inputWithIcon}>
                    <Text style={[styles.currencySymbol, { color: COLORS.success }]}>$</Text>
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textMuted}
                      value={montoAbono}
                      onChangeText={setMontoAbono}
                      keyboardType="numeric"
                      autoFocus
                      style={[globalStyles.inputGlass, { flex: 1, fontSize: 22, fontWeight: '800', borderWidth: 0 }]}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[globalStyles.btnPrimary, { backgroundColor: COLORS.success }, submittingAbono && { opacity: 0.7 }]}
                  onPress={handleGuardarAbono}
                  disabled={submittingAbono}
                  activeOpacity={0.85}
                >
                  {submittingAbono ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={globalStyles.btnPrimaryText}>REGISTRAR ABONO</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Modal>

        </Animated.View>
      </SafeAreaView>
    </BackgroundAnimated>
  );
}

const styles = StyleSheet.create({
  animatedContainer: { flex: 1 },
  listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  sectionHeaderTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 14 },
  flatListContent: { paddingBottom: 100, paddingTop: 4 },
  cardSeparada: {
    marginBottom: 20,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#151e32',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  targetIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.4)',
  },
  cardNombre: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  cardSubtext: { color: '#cbd5e1', fontSize: 12, marginTop: 3, fontWeight: '600' },
  deleteBtn: { padding: 4, backgroundColor: 'rgba(244, 63, 94, 0.15)', borderRadius: 10 },
  amountsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 8 },
  amountLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  amountValueAhorrado: { color: COLORS.success, fontSize: 18, fontWeight: '900', marginTop: 3 },
  amountValueObjetivo: { color: '#ffffff', fontSize: 18, fontWeight: '900', marginTop: 3 },
  progressTrack: { height: 10, backgroundColor: COLORS.inputBg, borderRadius: 5, overflow: 'hidden', marginVertical: 10 },
  progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  porcentajeText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  restanteText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  btnAbonar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
  },
  btnAbonarText: { color: '#ffffff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyTitle: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#151e32',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: { marginBottom: 16 },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  currencySymbol: { color: COLORS.primary, fontSize: 22, fontWeight: '800', marginRight: 8 },
  
  // Estilos de la Nueva Selección de Fecha
  shortcutsRow: { flexDirection: 'row', marginBottom: 10 },
  chipShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  chipShortcutText: { color: COLORS.primary, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  dateSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  calendarIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(14, 165, 233, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateSelectorLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  dateSelectorText: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginTop: 1 },

  frecuenciaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chipFrecuencia: {
    flex: 0.31,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  chipFrecuenciaActive: { backgroundColor: 'rgba(14, 165, 233, 0.25)', borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: COLORS.primary },
});