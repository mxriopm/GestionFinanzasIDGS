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
  Platform
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

interface Gasto {
  _id: string;
  monto: number;
  categoria: string;
  descripcion?: string;
  fecha: string;
}

export default function GastosDashboardScreen() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 🔑 Extraemos 'logout' del AuthContext
  const { logout } = useContext(AuthContext);

  // 1. Obtener gastos del backend
  const cargarGastos = useCallback(async () => {
    try {
      const res = await api.get('/gastos');
      const listaGastos = res.data.gastos || res.data || [];
      setGastos(listaGastos);
    } catch (error: any) {
      console.log('Error al obtener gastos:', error.response?.data || error.message);
      const msg = error.response?.data?.error || 'No se pudieron cargar los gastos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  // Recargar datos al deslizar hacia abajo
  const onRefresh = () => {
    setRefreshing(true);
    cargarGastos();
  };

  // Función para cerrar sesión con confirmación
  const handleLogout = () => {
    const salir = async () => {
      await logout();
    };

    if (Platform.OS === 'web') {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        salir();
      }
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que deseas salir de tu cuenta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar Sesión', style: 'destructive', onPress: salir }
        ]
      );
    }
  };

  // Eliminar un gasto
  const handleEliminarGasto = (id: string, descripcion?: string) => {
    const confirmar = async () => {
      try {
        await api.delete(`/gastos/_id/${id}`);
        setGastos((prev) => prev.filter((g) => g._id !== id));
        const msg = 'Gasto eliminado correctamente';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Éxito', msg);
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Error al eliminar el gasto';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`¿Deseas borrar el gasto "${descripcion || 'Seleccionado'}"?`)) {
        confirmar();
      }
    } else {
      Alert.alert(
        'Confirmar eliminación',
        `¿Eliminar el gasto "${descripcion || 'Seleccionado'}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmar },
        ]
      );
    }
  };

  // Calcular el total gastado
  const totalGastos = gastos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);

  // Formatear moneda (MXN)
  const formatMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(cantidad);
  };

  // Formatear fecha
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Tarjeta individual de gasto
  const renderGastoCard = ({ item }: { item: Gasto }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeCategoria}>
          <Text style={styles.textCategoria}>{item.categoria}</Text>
        </View>
        <Text style={styles.cardFecha}>{formatFecha(item.fecha)}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardDescripcion} numberOfLines={2}>
          {item.descripcion || 'Sin descripción'}
        </Text>
        <Text style={styles.cardMonto}>-{formatMoneda(item.monto)}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleEliminarGasto(item._id, item.descripcion)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Resumen del Total y Botón de Salir */}
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <Text style={styles.headerLabel}>Total de Gastos</Text>
          
          {/* 🔴 Botón de Cerrar Sesión */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTotal}>{formatMoneda(totalGastos)}</Text>
        <Text style={styles.headerSubtext}>{gastos.length} registro(s) asignado(s) a tu cuenta</Text>
      </View>

      {/* Lista de Gastos */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Historial de Movimientos</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Cargando tus datos...</Text>
          </View>
        ) : (
          <FlatList
            data={gastos}
            keyExtractor={(item) => item._id}
            renderItem={renderGastoCard}
            contentContainerStyle={styles.flatListContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#10b981"
                colors={['#10b981']}
              />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={styles.emptyTitle}>Sin gastos registrados</Text>
                <Text style={styles.emptySubtext}>
                  Los nuevos gastos que agregues aparecerán automáticamente en esta sección.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  headerContainer: {
    padding: 24,
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 13,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTotal: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ef4444',
    marginVertical: 4,
  },
  headerSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  flatListContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeCategoria: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textCategoria: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardFecha: {
    color: '#64748b',
    fontSize: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDescripcion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1,
    marginRight: 12,
  },
  cardMonto: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 14,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});