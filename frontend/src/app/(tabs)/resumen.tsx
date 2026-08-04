import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

export default function ResumenFinancieroScreen() {
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [numIngresos, setNumIngresos] = useState(0);
  const [numGastos, setNumGastos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout } = useContext(AuthContext);

  const cargarResumen = useCallback(async () => {
    try {
      const [resIngresos, resGastos] = await Promise.all([
        api.get('/ingresos'),
        api.get('/gastos')
      ]);

      const listaIngresos = resIngresos.data.ingresos || resIngresos.data || [];
      const listaGastos = resGastos.data.gastos || resGastos.data || [];

      const sumIngresos = listaIngresos.reduce((acc: number, curr: any) => acc + (Number(curr.monto) || 0), 0);
      const sumGastos = listaGastos.reduce((acc: number, curr: any) => acc + (Number(curr.monto) || 0), 0);

      setTotalIngresos(sumIngresos);
      setTotalGastos(sumGastos);
      setNumIngresos(listaIngresos.length);
      setNumGastos(listaGastos.length);
    } catch (error: any) {
      console.log('Error al obtener balance:', error.response?.data || error.message);
      const msg = error.response?.data?.error || 'No se pudo cargar el resumen financiero';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarResumen();
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (confirm('¿Deseas cerrar sesión?')) logout();
    } else {
      Alert.alert('Cerrar Sesión', '¿Deseas salir de tu cuenta?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => logout() }
      ]);
    }
  };

  const balanceNeto = totalIngresos - totalGastos;
  const esPositivo = balanceNeto >= 0;

  const totalMovimientos = totalIngresos + totalGastos;
  const pctIngresos = totalMovimientos > 0 ? Math.round((totalIngresos / totalMovimientos) * 100) : 50;
  const pctGastos = totalMovimientos > 0 ? 100 - pctIngresos : 50;

  const formatMoneda = (cant: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cant);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1d" />

      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="pie-chart" size={18} color="#3b82f6" />
          </View>
          <View>
            <Text style={styles.welcomeText}>Resumen General</Text>
            <Text style={styles.statusText}>● Balance en vivo</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconLogout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <>
            {/* Tarjeta de Balance Neto */}
            <View style={[styles.mainCard, { borderColor: esPositivo ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
              <Text style={styles.mainLabel}>Balance Disponible</Text>
              <Text style={[styles.mainAmount, { color: esPositivo ? '#10b981' : '#ef4444' }]}>
                {formatMoneda(balanceNeto)}
              </Text>

              <View style={styles.healthStatus}>
                <Ionicons
                  name={esPositivo ? 'checkmark-circle' : 'warning'}
                  size={16}
                  color={esPositivo ? '#10b981' : '#f59e0b'}
                />
                <Text style={[styles.healthText, { color: esPositivo ? '#10b981' : '#f59e0b' }]}>
                  {esPositivo
                    ? 'Salud financiera óptima: tus ingresos superan tus gastos.'
                    : 'Atención: has gastado más de lo que ingresaste este periodo.'}
                </Text>
              </View>
            </View>

            {/* Tarjetas Comparativas */}
            <View style={styles.rowCards}>
              <View style={styles.miniCard}>
                <View style={styles.miniHeader}>
                  <View style={[styles.miniIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <Ionicons name="arrow-up" size={16} color="#10b981" />
                  </View>
                  <Text style={styles.miniLabel}>Ingresos</Text>
                </View>
                <Text style={styles.miniAmount}>{formatMoneda(totalIngresos)}</Text>
                <Text style={styles.miniSub}>{numIngresos} movimiento(s)</Text>
              </View>

              <View style={styles.miniCard}>
                <View style={styles.miniHeader}>
                  <View style={[styles.miniIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                    <Ionicons name="arrow-down" size={16} color="#ef4444" />
                  </View>
                  <Text style={styles.miniLabel}>Gastos</Text>
                </View>
                <Text style={[styles.miniAmount, { color: '#ef4444' }]}>
                  -{formatMoneda(totalGastos)}
                </Text>
                <Text style={styles.miniSub}>{numGastos} movimiento(s)</Text>
              </View>
            </View>

            {/* Barra Proporcional */}
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Proporción de Flujo</Text>
              
              <View style={styles.barBackground}>
                <View style={[styles.barIngresos, { width: `${pctIngresos}%` }]} />
                <View style={[styles.barGastos, { width: `${pctGastos}%` }]} />
              </View>

              <View style={styles.progressLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.dotLegend, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Ingresos ({pctIngresos}%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dotLegend, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendText}>Gastos ({pctGastos}%)</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  mainCard: {
    backgroundColor: '#131b2e',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    marginBottom: 16,
  },
  mainLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  mainAmount: { fontSize: 38, fontWeight: '900', marginVertical: 8, letterSpacing: -1 },
  healthStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#0a0f1d', padding: 12, borderRadius: 12 },
  healthText: { fontSize: 12, fontWeight: '500', marginLeft: 8, flex: 1 },
  rowCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  miniCard: {
    flex: 0.48,
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  miniHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  miniIconBg: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  miniLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  miniAmount: { color: '#10b981', fontSize: 18, fontWeight: '800' },
  miniSub: { color: '#475569', fontSize: 11, marginTop: 4 },
  progressCard: {
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '700', marginBottom: 14 },
  barBackground: { height: 12, backgroundColor: '#0a0f1d', borderRadius: 6, flexDirection: 'row', overflow: 'hidden' },
  barIngresos: { backgroundColor: '#10b981', height: '100%' },
  barGastos: { backgroundColor: '#ef4444', height: '100%' },
  progressLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dotLegend: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
});