import React, { useState, useEffect, useCallback } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import HeaderBar from '../../components/HeaderBar';
import BalanceCard from '../../components/BalanceCard';
import BackgroundAnimated from '../../components/BackgroundAnimated';
import { COLORS, globalStyles } from '../../constants/theme';

interface Ingreso {
  _id: string;
  monto: number;
  categoria?: string;
  concepto?: string;
  descripcion?: string;
  fecha: string;
}

const CATEGORIAS_INGRESOS = [
  { nombre: 'Nómina', icon: 'cash-outline', color: '#10b981' },
  { nombre: 'Ventas', icon: 'cart-outline', color: '#38bdf8' },
  { nombre: 'Freelance', icon: 'laptop-outline', color: '#8b5cf6' },
  { nombre: 'Inversiones', icon: 'trending-up-outline', color: '#f59e0b' },
  { nombre: 'Regalo', icon: 'gift-outline', color: '#ec4899' },
  { nombre: 'Otros', icon: 'wallet-outline', color: '#06b6d4' },
];

export default function IngresosScreen() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cargarIngresos = useCallback(async () => {
    try {
      const res = await api.get('/ingresos');
<<<<<<< HEAD

      const listaIngresos = Array.isArray(res.data.ingresos)
        ? res.data.ingresos
        : Array.isArray(res.data)
        ? res.data
        : [];

=======
      
      // ✅ Normalización de respuesta API segura
      const listaIngresos = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.ingresos)
        ? res.data.ingresos
        : [];
      
>>>>>>> 8ffea35dd596669fe94cf2008540331139d57312
      setIngresos(listaIngresos);
    } catch (error: any) {
      setIngresos([]);
      const msg = error.response?.data?.error || error.response?.data?.message || 'No se pudieron cargar los ingresos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarIngresos();
  }, [cargarIngresos]);

  const handleCrearIngreso = async () => {
    const montoNum = parseFloat(monto);

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
      const fechaActual = new Date();

      const payload = {
        monto: montoNum,
        categoria: categoria.trim(),
        descripcion: descripcion.trim() || undefined,
        concepto: descripcion.trim() || categoria.trim(),
        mes: fechaActual.getMonth() + 1,
        año: fechaActual.getFullYear()
      };

      const res = await api.post('/ingresos', payload);
<<<<<<< HEAD
      const nuevoIngreso = res.data.ingreso || res.data;
      const registroValido = {
        ...nuevoIngreso,
        _id: nuevoIngreso._id ?? String(Date.now()),
      };

      setIngresos((prev) => [registroValido, ...prev]);
=======
      const nuevoIngreso = res.data?.ingreso || res.data;
      
      if (nuevoIngreso) {
        setIngresos((prev) => [nuevoIngreso, ...(Array.isArray(prev) ? prev : [])]);
      }

>>>>>>> 8ffea35dd596669fe94cf2008540331139d57312
      setMonto('');
      setCategoria('');
      setDescripcion('');
      setModalVisible(false);

      await cargarIngresos();

      const msg = '¡Ingreso registrado con éxito!';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Éxito', msg);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al guardar el ingreso';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarIngreso = (id: string, desc?: string) => {
    const borrar = async () => {
      try {
        await api.delete(`/ingresos/${id}`);
        setIngresos((prev) => (Array.isArray(prev) ? prev.filter((i) => i._id !== id) : []));
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Error al borrar';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`¿Eliminar ingreso "${desc || 'Seleccionado'}"?`)) borrar();
    } else {
      Alert.alert('Eliminar Movimiento', `¿Deseas borrar "${desc || 'este ingreso'}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: borrar }
      ]);
    }
  };

<<<<<<< HEAD
  const ingresosArray = Array.isArray(ingresos) ? ingresos : [];
  const totalIngresos = ingresosArray.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
=======
  // ✅ Reducción segura protegida con Array.isArray
  const totalIngresos = Array.isArray(ingresos)
    ? ingresos.reduce((acc, curr) => acc + (Number(curr?.monto) || 0), 0)
    : 0;
>>>>>>> 8ffea35dd596669fe94cf2008540331139d57312

  const formatMoneda = (cant: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cant || 0);

  const formatFecha = (fStr: string) => {
    if (!fStr) return 'Sin fecha';
    return new Date(fStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
    });
  };

  const renderIngresoCard = ({ item }: { item: Ingreso }) => {
    const nombreCategoria = item?.categoria || item?.concepto || 'General';

    return (
      <View style={[globalStyles.cardGlass, styles.cardOverride]}>
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="arrow-up-circle" size={24} color={COLORS.success} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardDescripcion} numberOfLines={1}>
              {item?.descripcion || item?.concepto || nombreCategoria}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardCategoriaBadge}>{nombreCategoria}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.cardFecha}>{formatFecha(item?.fecha)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.cardMonto}>+{formatMoneda(item?.monto)}</Text>
          <TouchableOpacity
            style={styles.deleteIconButton}
            onPress={() => handleEliminarIngreso(item?._id, item?.descripcion || item?.concepto)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
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
          title="Mis Ingresos"
          statusText="Patrimonio Actualizado"
          icon={<Ionicons name="wallet-outline" size={20} color={COLORS.primary} />}
        />

        <BalanceCard
          label="TOTAL INGRESADO"
          amount={totalIngresos}
          amountColor={COLORS.primary}
<<<<<<< HEAD
          countText={`${ingresosArray.length} entradas`}
=======
          countText={`${Array.isArray(ingresos) ? ingresos.length : 0} entradas`}
>>>>>>> 8ffea35dd596669fe94cf2008540331139d57312
          syncText="Sincronizado"
          icon={<MaterialCommunityIcons name="trending-up" size={24} color={COLORS.primary} />}
        />

        <View style={styles.listContainer}>
          <Text style={styles.sectionHeaderTitle}>Historial de Ingresos</Text>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
<<<<<<< HEAD
              data={ingresosArray}
              keyExtractor={(item, index) => item._id ?? String(index)}
=======
              data={Array.isArray(ingresos) ? ingresos : []}
              keyExtractor={(item, index) => item?._id || `ingreso-${index}`}
>>>>>>> 8ffea35dd596669fe94cf2008540331139d57312
              renderItem={renderIngresoCard}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={cargarIngresos} tintColor={COLORS.primary} />
              }
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Ionicons name="wallet-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>Sin ingresos registrados</Text>
                  <Text style={styles.emptySubtext}>Agrega entradas de dinero presionando el botón (+).</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Botón Flotante (+) */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>

        {/* Modal de Registro */}
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
                  <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.modalTitle}> Registrar Ingreso</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={COLORS.textSecondary} />
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
                      value={monto}
                      onChangeText={setMonto}
                      keyboardType="numeric"
                      style={[globalStyles.inputGlass, { flex: 1, fontSize: 20, fontWeight: '700', borderWidth: 0 }]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>Categorías Rápidas</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
                    {CATEGORIAS_INGRESOS.map((cat) => {
                      const isSelected = categoria.toLowerCase() === cat.nombre.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={cat.nombre}
                          style={[
                            styles.chipCategory,
                            isSelected && { backgroundColor: 'rgba(14, 165, 233, 0.25)', borderColor: COLORS.primary }
                          ]}
                          onPress={() => setCategoria(cat.nombre)}
                        >
                          <Ionicons name={cat.icon as any} size={14} color={isSelected ? COLORS.primary : COLORS.textMuted} />
                          <Text style={[styles.chipText, isSelected && { color: COLORS.textPrimary, fontWeight: '700' }]}>
                            {cat.nombre}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>O escribe otra categoría</Text>
                  <TextInput
                    placeholder="Ej. Bonos, Reembolsos"
                    placeholderTextColor={COLORS.textMuted}
                    value={categoria}
                    onChangeText={setCategoria}
                    style={globalStyles.inputGlass}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={globalStyles.label}>Nota / Descripción</Text>
                  <TextInput
                    placeholder="Detalle opcional..."
                    placeholderTextColor={COLORS.textMuted}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    style={[globalStyles.inputGlass, { height: 75, textAlignVertical: 'top' }]}
                    multiline
                  />
                </View>

                <TouchableOpacity
                  style={[globalStyles.btnPrimary, submitting && { opacity: 0.7 }, { marginTop: 10 }]}
                  onPress={handleCrearIngreso}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={globalStyles.btnPrimaryText}>Guardar Ingreso</Text>
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
  sectionHeaderTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  flatListContent: { paddingBottom: 90, paddingTop: 4 },
  cardOverride: {
    marginBottom: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardDescripcion: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardCategoriaBadge: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  dot: { color: COLORS.textMuted, marginHorizontal: 6, fontSize: 10 },
  cardFecha: { color: COLORS.textSecondary, fontSize: 12 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  cardMonto: { color: COLORS.success, fontSize: 16, fontWeight: '800' },
  deleteIconButton: { marginTop: 6, padding: 4 },
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
  chipText: { color: COLORS.textSecondary, fontSize: 12, marginLeft: 6 },
});