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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

interface Ingreso {
  _id: string;
  monto: number;
  categoria?: string;
  concepto?: string;
  descripcion?: string;
  fecha: string;
}

// Categorías rápidas para Ingresos
const CATEGORIAS_INGRESOS = [
  { nombre: 'Nómina', icon: 'cash-outline', color: '#10b981' },
  { nombre: 'Ventas', icon: 'cart-outline', color: '#3b82f6' },
  { nombre: 'Freelance', icon: 'laptop-outline', color: '#8b5cf6' },
  { nombre: 'Inversiones', icon: 'trending-up-outline', color: '#f59e0b' },
  { nombre: 'Regalo', icon: 'gift-outline', color: '#ec4899' },
  { nombre: 'Otros', icon: 'wallet-outline', color: '#06b6d4' },
];

export default function IngresosScreen() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { logout } = useContext(AuthContext);

  const cargarIngresos = useCallback(async () => {
    try {
      const res = await api.get('/ingresos');
      const listaIngresos = res.data.ingresos || res.data || [];
      setIngresos(listaIngresos);
    } catch (error: any) {
      console.log('Error al obtener ingresos:', error.response?.data || error.message);
      const msg = error.response?.data?.error || 'No se pudieron cargar los ingresos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarIngresos();
  }, [cargarIngresos]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarIngresos();
  };

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

      // Payload compatible con el modelo Mongoose
      const payload = {
        monto: montoNum,
        categoria: categoria.trim(),
        descripcion: descripcion.trim() || undefined,
        concepto: descripcion.trim() || categoria.trim(),
        mes: fechaActual.getMonth() + 1, // Número del 1 al 12
        año: fechaActual.getFullYear()
      };

      const res = await api.post('/ingresos', payload);

      const nuevoIngreso = res.data.ingreso || res.data;
      setIngresos((prev) => [nuevoIngreso, ...prev]);

      setMonto('');
      setCategoria('');
      setDescripcion('');
      setModalVisible(false);

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
        await api.delete(`/ingresos/_id/${id}`);
        setIngresos((prev) => prev.filter((i) => i._id !== id));
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

const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas cerrar sesión?')) {
        await logout();
      }
    } else {
      Alert.alert('Cerrar Sesión', '¿Deseas salir de tu cuenta?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: async () => await logout() }
      ]);
    }
  };
  const totalIngresos = ingresos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);

  const formatMoneda = (cant: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cant);

  const formatFecha = (fStr: string) => {
    if (!fStr) return '';
    return new Date(fStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Función protegida contra valores undefined o null
  const getCategoriaIcon = (catName?: string) => {
    if (!catName) return { icon: 'arrow-up-circle-outline', color: '#10b981' };
    const cat = CATEGORIAS_INGRESOS.find(c => c.nombre.toLowerCase() === catName.toLowerCase());
    return cat ? { icon: cat.icon, color: cat.color } : { icon: 'arrow-up-circle-outline', color: '#10b981' };
  };

  const renderIngresoCard = ({ item }: { item: Ingreso }) => {
    const nombreCategoria = item.categoria || item.concepto || 'General';
    const { icon, color } = getCategoriaIcon(nombreCategoria);

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
            <Ionicons name={icon as any} size={22} color={color} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardDescripcion} numberOfLines={1}>
              {item.descripcion || item.concepto || nombreCategoria}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardCategoriaBadge}>{nombreCategoria}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.cardFecha}>{formatFecha(item.fecha)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.cardMonto}>+{formatMoneda(item.monto)}</Text>
          <TouchableOpacity
            style={styles.deleteIconButton}
            onPress={() => handleEliminarIngreso(item._id, item.descripcion || item.concepto)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1d" />

      {/* Top Bar / Header */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="arrow-up-circle" size={20} color="#10b981" />
          </View>
          <View>
            <Text style={styles.welcomeText}>Mis Ingresos</Text>
            <Text style={styles.statusText}></Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconLogout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Tarjeta de Saldo Principal */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Ingresado</Text>
          <MaterialCommunityIcons name="trending-up" size={24} color="#10b981" />
        </View>

        <Text style={styles.balanceAmount}>{formatMoneda(totalIngresos)}</Text>

        <View style={styles.balanceFooter}>
          <View style={styles.badgeCount}>
            <Ionicons name="receipt-outline" size={12} color="#10b981" />
            <Text style={styles.badgeCountText}>{ingresos.length} entradas</Text>
          </View>
          <Text style={styles.syncText}>Sincronizado</Text>
        </View>
      </View>

      {/* Lista de Movimientos */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Historial de Ingresos</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : (
          <FlatList
            data={ingresos}
            keyExtractor={(item) => item._id}
            renderItem={renderIngresoCard}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Ionicons name="wallet-outline" size={48} color="#1e293b" />
                <Text style={styles.emptyTitle}>Sin ingresos registrados</Text>
                <Text style={styles.emptySubtext}>Agrega entradas de dinero presionando el botón (+).</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Botón Flotante (FAB) */}
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
                <Ionicons name="add-circle-outline" size={24} color="#10b981" />
                <Text style={styles.modalTitle}> Registrar Ingreso</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#475569"
                    value={monto}
                    onChangeText={setMonto}
                    keyboardType="numeric"
                    style={[styles.input, { fontSize: 20, fontWeight: '700' }]}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categorías Rápidas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
                  {CATEGORIAS_INGRESOS.map((cat) => {
                    const isSelected = categoria.toLowerCase() === cat.nombre.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={cat.nombre}
                        style={[
                          styles.chipCategory,
                          isSelected && { backgroundColor: `${cat.color}25`, borderColor: cat.color }
                        ]}
                        onPress={() => setCategoria(cat.nombre)}
                      >
                        <Ionicons name={cat.icon as any} size={14} color={isSelected ? cat.color : '#64748b'} />
                        <Text style={[styles.chipText, isSelected && { color: cat.color, fontWeight: '700' }]}>
                          {cat.nombre}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>O escribe otra categoría</Text>
                <TextInput
                  placeholder="Ej. Bonos, Reembolsos"
                  placeholderTextColor="#475569"
                  value={categoria}
                  onChangeText={setCategoria}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nota / Descripción</Text>
                <TextInput
                  placeholder="Detalle opcional..."
                  placeholderTextColor="#475569"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleCrearIngreso}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.submitButtonText}>Guardar Ingreso</Text>
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
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  welcomeText: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  statusText: { color: '#10b981', fontSize: 11, fontWeight: '500' },
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
  balanceLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceAmount: { color: '#10b981', fontSize: 36, fontWeight: '900', marginVertical: 8, letterSpacing: -0.5 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  badgeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeCountText: { color: '#10b981', fontSize: 11, fontWeight: '700', marginLeft: 4 },
  syncText: { color: '#475569', fontSize: 11 },
  listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { color: '#f8fafc', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  flatListContent: { paddingBottom: 90 },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardDescripcion: { color: '#f8fafc', fontSize: 15, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  cardCategoriaBadge: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  dot: { color: '#475569', marginHorizontal: 6, fontSize: 10 },
  cardFecha: { color: '#64748b', fontSize: 11 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  cardMonto: { color: '#10b981', fontSize: 16, fontWeight: '800' },
  deleteIconButton: { marginTop: 6, padding: 2 },
  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyTitle: { color: '#94a3b8', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtext: { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#10b981',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#10b981',
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
  currencySymbol: { color: '#10b981', fontSize: 20, fontWeight: '800', marginRight: 8 },
  input: {
    flex: 1,
    backgroundColor: '#0a0f1d',
    color: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  categoriesRow: { flexDirection: 'row', marginBottom: 4 },
  chipCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chipText: { color: '#64748b', fontSize: 12, marginLeft: 6 },
  submitButton: {
    backgroundColor: '#10b981',
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