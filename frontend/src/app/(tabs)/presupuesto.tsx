import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import HeaderBar from '../../components/HeaderBar';
import BalanceCard from '../../components/BalanceCard';
import BackgroundAnimated from '../../components/BackgroundAnimated';
import { COLORS, globalStyles } from '../../constants/theme';

interface Presupuesto {
  _id: string;
  categoria?: string;
  nombre?: string;
  montoObjetivo: number;
  montoAhorrado?: number;
  montoGastado?: number;
  mes?: number;
  año?: number;
}

export default function PresupuestoScreen() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cargarPresupuestos = useCallback(async () => {
    try {
      const res = await api.get('/presupuestos');
      const lista = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.presupuestos)
        ? res.data.presupuestos
        : [];

      setPresupuestos(lista);
    } catch (error: any) {
      setPresupuestos([]);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudieron cargar los presupuestos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarPresupuestos();
    }, [cargarPresupuestos])
  );

  const handleCrearPresupuesto = async () => {
    const montoNum = parseFloat(montoObjetivo);
    if (isNaN(montoNum) || montoNum <= 0) {
      const msg = 'Ingresa un monto objetivo válido mayor a $0';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Monto requerido', msg);
      return;
    }

    if (!nombre.trim()) {
      const msg = 'Ingresa una categoría o concepto para el presupuesto';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Nombre requerido', msg);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/presupuestos', {
        categoria: nombre.trim(),
        nombre: nombre.trim(),
        montoObjetivo: montoNum,
      });

      const nuevo = res.data?.presupuesto || res.data;
      if (nuevo) {
        setPresupuestos((prev) => [nuevo, ...(Array.isArray(prev) ? prev : [])]);
      }

      setNombre('');
      setMontoObjetivo('');
      setModalVisible(false);

      const msg = 'Presupuesto creado correctamente';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Éxito', msg);
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Error al guardar el presupuesto';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarPresupuesto = (id: string, cat?: string) => {
    const borrar = async () => {
      try {
        await api.delete(`/presupuestos/${id}`);
        setPresupuestos((prev) => (Array.isArray(prev) ? prev.filter((p) => p._id !== id) : []));
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Error al borrar';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`¿Eliminar presupuesto "${cat || 'Seleccionado'}"?`)) borrar();
    } else {
      Alert.alert(
        'Eliminar Presupuesto',
        `¿Deseas borrar "${cat || 'este presupuesto'}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: borrar },
        ]
      );
    }
  };

  const totalObjetivo = Array.isArray(presupuestos)
    ? presupuestos.reduce((acc, curr) => acc + (Number(curr?.montoObjetivo) || 0), 0)
    : 0;

  const totalAhorrado = Array.isArray(presupuestos)
    ? presupuestos.reduce(
        (acc, curr) => acc + (Number(curr?.montoAhorrado || curr?.montoGastado) || 0),
        0
      )
    : 0;

  const formatMoneda = (cant: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cant || 0);

  const renderPresupuestoCard = ({ item }: { item: Presupuesto }) => {
    const objetivo = Number(item?.montoObjetivo) || 0;
    const usado = Number(item?.montoAhorrado || item?.montoGastado) || 0;
    const porcentaje = objetivo > 0 ? Math.min(Math.round((usado / objetivo) * 100), 100) : 0;

    return (
      <View style={[globalStyles.cardGlass, styles.cardOverride]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="target" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>{item?.categoria || item?.nombre || 'Presupuesto'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleEliminarPresupuesto(item?._id, item?.categoria || item?.nombre)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={16} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.montoRow}>
          <Text style={styles.montoLabel}>Límite: {formatMoneda(objetivo)}</Text>
          <Text style={styles.montoProgress}>
            {formatMoneda(usado)} ({porcentaje}%)
          </Text>
        </View>

        <View style={styles.trackBar}>
          <View
            style={[
              styles.fillBar,
              {
                width: `${porcentaje}%`,
                backgroundColor: porcentaje >= 90 ? COLORS.danger : COLORS.primary,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <BackgroundAnimated>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <HeaderBar
          title="Presupuestos"
          icon={<Ionicons name="pie-chart-outline" size={20} color={COLORS.primary} />}
        />

        <BalanceCard
          label="Total Presupuestado"
          amount={totalObjetivo}
          amountColor={COLORS.primary}
          countText={`${Array.isArray(presupuestos) ? presupuestos.length : 0} límites`}
          syncText="Sincronizado"
          icon={<MaterialCommunityIcons name="chart-donut" size={24} color={COLORS.primary} />}
        />

        <View style={styles.listContainer}>
          <Text style={globalStyles.titleModern}>Mis Metas de Control</Text>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={Array.isArray(presupuestos) ? presupuestos : []}
              keyExtractor={(item, index) => item?._id || `presupuesto-${index}`}
              renderItem={renderPresupuestoCard}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={cargarPresupuestos} tintColor={COLORS.primary} />
              }
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Feather name="pie-chart" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>Sin presupuestos</Text>
                  <Text style={styles.emptySubtext}>Crea límites de gastos presionando el botón (+).</Text>
                </View>
              }
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={28} color="#090d16" />
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Feather name="plus-circle" size={22} color={COLORS.primary} />
                  <Text style={styles.modalTitle}> Nuevo Presupuesto</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Feather name="x" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>Categoría / Concepto</Text>
                  <TextInput
                    placeholder="Ej. Comida, Entretenimiento"
                    placeholderTextColor={COLORS.textMuted}
                    value={nombre}
                    onChangeText={setNombre}
                    style={globalStyles.inputGlass}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>Monto Límite ($ MXN)</Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textMuted}
                    value={montoObjetivo}
                    onChangeText={setMontoObjetivo}
                    keyboardType="numeric"
                    style={globalStyles.inputGlass}
                  />
                </View>

                <TouchableOpacity
                  style={[globalStyles.btnPrimary, submitting && { opacity: 0.7 }, { marginTop: 10 }]}
                  onPress={handleCrearPresupuesto}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#090d16" />
                  ) : (
                    <Text style={globalStyles.btnPrimaryText}>Guardar Presupuesto</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </BackgroundAnimated>
  );
}

const styles = StyleSheet.create({
  listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  flatListContent: { paddingBottom: 90, paddingTop: 10 },
  cardOverride: { marginBottom: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  montoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  montoLabel: { color: COLORS.textSecondary, fontSize: 12 },
  montoProgress: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  trackBar: { height: 8, backgroundColor: COLORS.inputBg, borderRadius: 4, overflow: 'hidden' },
  fillBar: { height: '100%', borderRadius: 4 },
  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyTitle: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },
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
});
