import React, { useState, useEffect, useCallback, useContext } from 'react';
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
  StatusBar
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

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

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  
  // Estado para la fecha con Calendario
  const [fechaObj, setFechaObj] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [frecuenciaAhorro, setFrecuenciaAhorro] = useState<'semanal' | 'quincenal' | 'mensual'>('mensual');
  const [submitting, setSubmitting] = useState(false);

  const { logout } = useContext(AuthContext);

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

  const onRefresh = () => {
    setRefreshing(true);
    cargarPresupuestos();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFechaObj(selectedDate);
    }
  };

  const handleCrearPresupuesto = async () => {
    const montoNum = parseFloat(montoObjetivo);

    if (!nombre.trim()) {
      const msg = 'Ingresa un nombre para el presupuesto / meta';
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

      // Payload que incluye 'concepto' requerido por Mongoose
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
      setFechaObj(new Date());
      setModalVisible(false);
      cargarPresupuestos();

      const msg = 'Presupuesto creado con éxito';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Éxito', msg);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al guardar el presupuesto';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
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
      Alert.alert('Eliminar Presupuesto', `¿Deseas borrar "${itemNombre}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: borrar },
      ]);
    }
  };

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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.targetIcon}>
              <Feather name="target" size={18} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.cardNombre}>{titulo}</Text>
              <Text style={styles.cardSubtext}>
                Límite: {formatFecha(item.fechaLimite)} • {item.frecuenciaAhorro}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleEliminarPresupuesto(item._id, titulo)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.amountsRow}>
          <View>
            <Text style={styles.amountLabel}>Ahorrado</Text>
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1d" />

      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#3b82f6" />
          </View>
          <View>
            <Text style={styles.welcomeText}>Presupuestos y Metas</Text>
            <Text style={styles.statusText}>● Control Financiero</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconLogout} onPress={handleLogout}>
          <Feather name="power" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Resumen Total Ahorrado */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Progreso General de Metas</Text>
          <Feather name="trending-up" size={20} color="#3b82f6" />
        </View>

        <Text style={styles.balanceAmount}>{formatMoneda(totalAhorrado)}</Text>

        <View style={styles.balanceFooter}>
          <View style={styles.badgeCount}>
            <Feather name="check-circle" size={12} color="#3b82f6" />
            <Text style={styles.badgeCountText}>{presupuestos.length} metas activas</Text>
          </View>
          <Text style={styles.syncText}>Meta Total: {formatMoneda(totalObjetivo)}</Text>
        </View>
      </View>

      {/* Lista de Presupuestos */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Mis Metas de Ahorro</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            data={presupuestos}
            keyExtractor={(item) => item._id}
            renderItem={renderPresupuestoCard}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Feather name="compass" size={48} color="#1e293b" />
                <Text style={styles.emptyTitle}>Sin presupuestos definidos</Text>
                <Text style={styles.emptySubtext}>Crea tu primer meta u objetivo presionando el botón (+).</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Botón Flotante */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal con Selección de Fecha mediante Calendario */}
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
                <Feather name="plus-circle" size={22} color="#3b82f6" />
                <Text style={styles.modalTitle}> Nuevo Presupuesto</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre / Concepto de la Meta</Text>
                <TextInput
                  placeholder="Ej. Fondo de Emergencia, Vacaciones"
                  placeholderTextColor="#475569"
                  value={nombre}
                  onChangeText={setNombre}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto Objetivo ($ MXN)</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                    value={montoObjetivo}
                    onChangeText={setMontoObjetivo}
                    keyboardType="numeric"
                    style={[styles.input, { fontSize: 18, fontWeight: '700', borderWidth: 0 }]}
                  />
                </View>
              </View>

              {/* Selector con Calendario */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha Límite</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={fechaObj.toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) setFechaObj(new Date(e.target.value));
                    }}
                    style={{
                      backgroundColor: '#0a0f1d',
                      color: '#f8fafc',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid #1e293b',
                      fontSize: '14px',
                      width: '100%',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dateSelectorButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Feather name="calendar" size={18} color="#3b82f6" style={{ marginRight: 10 }} />
                      <Text style={styles.dateSelectorText}>
                        {fechaObj.toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={fechaObj}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={handleDateChange}
                      />
                    )}
                  </>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Frecuencia de Ahorro</Text>
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
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleCrearPresupuesto}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="check" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.submitButtonText}>Guardar Meta</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1d' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  welcomeText: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  statusText: { color: '#3b82f6', fontSize: 11, fontWeight: '500' },
  iconLogout: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  balanceCard: {
    backgroundColor: '#131b2e',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceAmount: { color: '#3b82f6', fontSize: 36, fontWeight: '900', marginVertical: 8, letterSpacing: -0.5 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  badgeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeCountText: { color: '#3b82f6', fontSize: 11, fontWeight: '700', marginLeft: 4 },
  syncText: { color: '#64748b', fontSize: 11 },
  listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  flatListContent: { paddingBottom: 90 },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  targetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardNombre: { color: '#f8fafc', fontSize: 15, fontWeight: '700' },
  cardSubtext: { color: '#64748b', fontSize: 11, marginTop: 2 },
  amountsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  amountLabel: { color: '#64748b', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  amountValueAhorrado: { color: '#10b981', fontSize: 16, fontWeight: '800', marginTop: 2 },
  amountValueObjetivo: { color: '#f8fafc', fontSize: 16, fontWeight: '800', marginTop: 2 },
  progressTrack: { height: 8, backgroundColor: '#0a0f1d', borderRadius: 4, overflow: 'hidden', marginVertical: 6 },
  progressBar: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  porcentajeText: { color: '#3b82f6', fontSize: 11, fontWeight: '700' },
  restanteText: { color: '#94a3b8', fontSize: 11 },
  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyTitle: { color: '#94a3b8', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtext: { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3b82f6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#131b2e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: { marginBottom: 16 },
  label: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  currencySymbol: { color: '#3b82f6', fontSize: 18, fontWeight: '800', marginRight: 8 },
  input: {
    backgroundColor: '#0a0f1d',
    color: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  dateSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  dateSelectorText: { color: '#f8fafc', fontSize: 14, fontWeight: '600' },
  frecuenciaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chipFrecuencia: {
    flex: 0.31,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0a0f1d',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chipFrecuenciaActive: { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6' },
  chipText: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  chipTextActive: { color: '#3b82f6' },
  submitButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});