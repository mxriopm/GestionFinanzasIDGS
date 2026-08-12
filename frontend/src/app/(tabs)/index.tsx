import React, { useState, useCallback, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import HeaderBar from '../../components/HeaderBar';
import BalanceCard from '../../components/BalanceCard';
import BackgroundAnimated from '../../components/BackgroundAnimated';
import { COLORS, globalStyles } from '../../constants/theme';

interface Gasto {
  _id: string;
  monto: number;
  categoria: string;
  descripcion?: string;
  fecha: string;
}

const CATEGORIAS_RAPIDAS = [
  { nombre: 'Comida', icon: 'fast-food-outline', color: '#f59e0b' },
  { nombre: 'Transporte', icon: 'car-outline', color: '#0ea5e9' },
  { nombre: 'Servicios', icon: 'flash-outline', color: '#eab308' },
  { nombre: 'Compras', icon: 'cart-outline', color: '#ec4899' },
  { nombre: 'Entretenimiento', icon: 'game-controller-outline', color: '#8b5cf6' },
  { nombre: 'Salud', icon: 'medkit-outline', color: '#10b981' },
];

export default function GastosDashboardScreen() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [montoText, setMontoText] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fabScale = useRef(new Animated.Value(1)).current;

  const animateFab = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const cargarGastos = useCallback(async () => {
    try {
      const res = await api.get('/gastos');
      const lista = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.gastos)
        ? res.data.gastos
        : [];

      setGastos(lista);
    } catch (error: any) {
      setGastos([]);
      const msg = error.response?.data?.error || error.response?.data?.message || 'No se pudieron cargar los gastos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarGastos();
    }, [cargarGastos])
  );

  const handleCrearGasto = async () => {
    const valorLimpio = montoText.replace(',', '.').trim();
    const montoNum = parseFloat(valorLimpio);

    if (isNaN(montoNum) || montoNum <= 0) {
      const msg = 'Ingresa un monto válido mayor a $0';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Monto requerido', msg);
      return;
    }
    if (!categoria.trim()) {
      const msg = 'Selecciona o escribe una categoría';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Categoría requerida', msg);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        monto: montoNum,
        categoria: categoria.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha: new Date().toISOString(),
      };

      const res = await api.post('/gastos', payload);

      let gastoCreado = res.data?.gasto || res.data;

      if (gastoCreado && typeof gastoCreado === 'object') {
        gastoCreado = {
          ...gastoCreado,
          monto: gastoCreado.monto || montoNum,
          categoria: gastoCreado.categoria || categoria.trim(),
          descripcion: gastoCreado.descripcion || descripcion.trim(),
          fecha: gastoCreado.fecha || new Date().toISOString(),
        };

        setGastos((prev) => [gastoCreado, ...(Array.isArray(prev) ? prev : [])]);
      }

      setMontoText('');
      setCategoria('');
      setDescripcion('');
      setModalVisible(false);

      const msg = 'Gasto registrado correctamente';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Éxito', msg);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al guardar el gasto';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarGasto = (id: string, desc?: string) => {
    const borrar = async () => {
      try {
        await api.delete(`/gastos/${id}`);
        setGastos((prev) => (Array.isArray(prev) ? prev.filter((g) => g._id !== id) : []));
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Error al borrar';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`¿Eliminar gasto "${desc || 'Seleccionado'}"?`)) borrar();
    } else {
      Alert.alert('Eliminar Movimiento', `¿Deseas borrar "${desc || 'este gasto'}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: borrar },
      ]);
    }
  };

  const gastosFiltrados = Array.isArray(gastos)
    ? gastos.filter((g) => {
        const termino = busqueda.toLowerCase().trim();
        if (!termino) return true;
        return (
          (g?.categoria && g.categoria.toLowerCase().includes(termino)) ||
          (g?.descripcion && g.descripcion.toLowerCase().includes(termino)) ||
          (g?.monto && g.monto.toString().includes(termino))
        );
      })
    : [];

  const totalGastos = Array.isArray(gastos)
    ? gastos.reduce((acc, curr) => acc + (Number(curr?.monto) || 0), 0)
    : 0;

  const getCategoriaIcon = (catName?: string) => {
    if (!catName) return { icon: 'wallet-outline', color: COLORS.danger };
    const cat = CATEGORIAS_RAPIDAS.find((c) => c.nombre.toLowerCase() === catName.toLowerCase());
    return cat ? { icon: cat.icon, color: cat.color } : { icon: 'wallet-outline', color: COLORS.danger };
  };

  const renderGastoCard = ({ item }: { item: Gasto }) => {
    const { icon, color } = getCategoriaIcon(item?.categoria);
    const valorMonto = Number(item?.monto) || 0;

    return (
      <View style={[globalStyles.cardGlass, styles.cardOverride]}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
            <Ionicons name={icon as any} size={22} color={color} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardDescripcion} numberOfLines={1}>
              {item?.descripcion || item?.categoria || 'Gasto General'}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardCategoriaBadge}>{item?.categoria || 'General'}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.cardFecha}>
                {item?.fecha
                  ? new Date(item.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                  : 'Sin fecha'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.cardMonto}>
            -{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valorMonto)}
          </Text>
          <TouchableOpacity
            style={styles.deleteIconButton}
            onPress={() => handleEliminarGasto(item?._id, item?.descripcion)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={16} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <BackgroundAnimated>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <HeaderBar
          title="Gestión de Gastos"
          icon={<Ionicons name="card-outline" size={20} color={COLORS.danger} />}
        />

        <BalanceCard
          label="Total Gastado"
          amount={totalGastos}
          amountColor={COLORS.danger}
          countText={`${Array.isArray(gastos) ? gastos.length : 0} registros`}
          syncText="Tiempo Real ⚡"
          icon={<MaterialCommunityIcons name="arrow-bottom-left-bold-box-outline" size={24} color={COLORS.danger} />}
        />

        <View style={styles.listContainer}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Buscar gasto por concepto o categoría..."
              placeholderTextColor={COLORS.textMuted}
              value={busqueda}
              onChangeText={setBusqueda}
              style={styles.searchInput}
            />
            {busqueda ? (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <Feather name="x" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={globalStyles.titleModern}>Movimientos Recientes</Text>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={gastosFiltrados}
              keyExtractor={(item, index) => item?._id || `gasto-${index}`}
              renderItem={renderGastoCard}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={cargarGastos} tintColor={COLORS.primary} />
              }
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Feather name="inbox" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>Sin coincidencias</Text>
                  <Text style={styles.emptySubtext}>No se encontraron registros de gastos.</Text>
                </View>
              }
            />
          )}
        </View>

        <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity
            style={[globalStyles.btnPrimary, styles.fabButton]}
            onPress={() => {
              animateFab();
              setModalVisible(true);
            }}
            activeOpacity={0.9}
          >
            <Feather name="plus" size={28} color="#090d16" />
          </TouchableOpacity>
        </Animated.View>

        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Feather name="plus-circle" size={22} color={COLORS.primary} />
                  <Text style={styles.modalTitle}> Registrar Gasto</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Feather name="x" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>Monto ($ MXN)</Text>
                  <View style={styles.inputWithIcon}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textMuted}
                      value={montoText}
                      onChangeText={setMontoText}
                      keyboardType="numeric"
                      style={[globalStyles.inputGlass, { flex: 1, fontSize: 20, fontWeight: '700', borderWidth: 0 }]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>Categorías Rápidas</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
                    {CATEGORIAS_RAPIDAS.map((cat) => {
                      const isSelected = categoria.toLowerCase() === cat.nombre.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={cat.nombre}
                          style={[
                            styles.chipCategory,
                            isSelected && { backgroundColor: `${cat.color}25`, borderColor: cat.color },
                          ]}
                          onPress={() => setCategoria(cat.nombre)}
                        >
                          <Ionicons name={cat.icon as any} size={14} color={isSelected ? cat.color : COLORS.textMuted} />
                          <Text style={[styles.chipText, isSelected && { color: cat.color, fontWeight: '700' }]}>
                            {cat.nombre}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>O Escribe una Categoría</Text>
                  <TextInput
                    placeholder="Ej. Suscripciones, Regalos"
                    placeholderTextColor={COLORS.textMuted}
                    value={categoria}
                    onChangeText={setCategoria}
                    style={globalStyles.inputGlass}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>Descripción (Opcional)</Text>
                  <TextInput
                    placeholder="Nota o detalle del movimiento..."
                    placeholderTextColor={COLORS.textMuted}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    style={[globalStyles.inputGlass, { height: 75, textAlignVertical: 'top' }]}
                    multiline
                  />
                </View>

                <TouchableOpacity
                  style={[globalStyles.btnPrimary, submitting && { opacity: 0.7 }, { marginTop: 10 }]}
                  onPress={handleCrearGasto}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#090d16" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Feather name="check" size={20} color="#090d16" style={{ marginRight: 6 }} />
                      <Text style={globalStyles.btnPrimaryText}>Guardar Gasto</Text>
                    </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  cardOverride: {
    marginBottom: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardDescripcion: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  cardCategoriaBadge: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  dot: { color: COLORS.textMuted, marginHorizontal: 6, fontSize: 10 },
  cardFecha: { color: COLORS.textMuted, fontSize: 11 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  cardMonto: { color: COLORS.danger, fontSize: 16, fontWeight: '800' },
  deleteIconButton: { marginTop: 6, padding: 2 },
  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyTitle: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },
  fabContainer: { position: 'absolute', bottom: 24, right: 24 },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    paddingVertical: 0,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
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
  currencySymbol: { color: COLORS.primary, fontSize: 20, fontWeight: '800', marginRight: 8 },
  categoriesRow: { flexDirection: 'row', marginBottom: 4 },
  chipCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  chipText: { color: COLORS.textMuted, fontSize: 12, marginLeft: 6 },
});