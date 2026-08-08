import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import api from '../../services/api';
import HeaderBar from '../../components/HeaderBar';
import BackgroundAnimated from '../../components/BackgroundAnimated';
import { COLORS, globalStyles } from '../../constants/theme';
import { generarReportePDF } from '../../utils/pdfGenerator';
import { triggerHaptic } from '../../utils/haptics';

interface Gasto {
  monto: number;
  categoria: string;
}

export default function ResumenFinancieroScreen() {
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [numIngresos, setNumIngresos] = useState(0);
  const [numGastos, setNumGastos] = useState(0);
  const [listaGastos, setListaGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);

  const cargarResumen = useCallback(async () => {
    try {
      const [resIngresos, resGastos] = await Promise.all([
        api.get('/ingresos'),
        api.get('/gastos')
      ]);

      const arrayIngresos = resIngresos.data.ingresos || resIngresos.data || [];
      const arrayGastos: Gasto[] = resGastos.data.gastos || resGastos.data || [];

      const sumIngresos = arrayIngresos.reduce((acc: number, curr: any) => acc + (Number(curr.monto) || 0), 0);
      const sumGastos = arrayGastos.reduce((acc: number, curr: any) => acc + (Number(curr.monto) || 0), 0);

      setTotalIngresos(sumIngresos);
      setTotalGastos(sumGastos);
      setNumIngresos(arrayIngresos.length);
      setNumGastos(arrayGastos.length);
      setListaGastos(arrayGastos);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'No se pudo cargar el resumen financiero';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarResumen();
    }, [cargarResumen])
  );

  const balanceNeto = totalIngresos - totalGastos;
  const esPositivo = balanceNeto >= 0;

  const totalMovimientos = totalIngresos + totalGastos;
  const pctIngresos = totalMovimientos > 0 ? Math.round((totalIngresos / totalMovimientos) * 100) : 50;
  const pctGastos = totalMovimientos > 0 ? 100 - pctIngresos : 50;

  // CÁLCULO DE SCORE DE SALUD FINANCIERA (0 a 100 PTS)
  const calcularScoreFinanciero = () => {
    if (totalIngresos === 0) return 50;
    const porcentajeAhorro = (balanceNeto / totalIngresos) * 100;
    if (porcentajeAhorro >= 30) return 95;
    if (porcentajeAhorro >= 20) return 85;
    if (porcentajeAhorro >= 10) return 70;
    if (porcentajeAhorro >= 0) return 55;
    return 30;
  };

  const score = calcularScoreFinanciero();

  const obtenerEstadisticasGastos = () => {
    if (totalGastos === 0) return [];
    const mapa: { [key: string]: number } = {};
    listaGastos.forEach((g) => {
      const cat = g.categoria || 'Otros';
      mapa[cat] = (mapa[cat] || 0) + Number(g.monto);
    });

    return Object.keys(mapa)
      .map((cat) => ({
        categoria: cat,
        monto: mapa[cat],
        porcentaje: Math.round((mapa[cat] / totalGastos) * 100),
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 4);
  };

  const estadisticasGastos = obtenerEstadisticasGastos();

  const handleExportarPDF = async () => {
    triggerHaptic('medium');
    setExportandoPDF(true);

    try {
      const [resIng, resGas] = await Promise.all([
        api.get('/ingresos'),
        api.get('/gastos')
      ]);

      const ingresos = (resIng.data.ingresos || resIng.data || []).map((i: any) => ({
        tipo: 'Ingreso' as const,
        monto: Number(i.monto),
        categoria: i.categoria || 'Ingresos',
        descripcion: i.concepto || i.descripcion,
        fecha: i.fecha,
      }));

      const gastos = (resGas.data.gastos || resGas.data || []).map((g: any) => ({
        tipo: 'Gasto' as const,
        monto: Number(g.monto),
        categoria: g.categoria || 'General',
        descripcion: g.descripcion,
        fecha: g.fecha,
      }));

      const todosMovimientos = [...ingresos, ...gastos].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

      await generarReportePDF(todosMovimientos, totalIngresos, totalGastos, 'Juan Pablo');
      triggerHaptic('success');
    } catch (err) {
      triggerHaptic('error');
      const msg = 'No se pudieron consultar los movimientos para generar el PDF';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setExportandoPDF(false);
    }
  };

  const formatMoneda = (cant: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cant);

  return (
    <BackgroundAnimated>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <HeaderBar
          title="Resumen General"
          statusText="Score Financiero ⚡"
          icon={<Ionicons name="pie-chart-outline" size={20} color={COLORS.primary} />}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={cargarResumen} tintColor={COLORS.primary} />
          }
        >
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              {/* Tarjeta de Balance con Score */}
              <View style={[
                globalStyles.cardGlass,
                styles.mainCard,
                { borderColor: esPositivo ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)' }
              ]}>
                <View style={styles.scoreRow}>
                  <Text style={globalStyles.label}>Balance Disponible</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: score >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)' }]}>
                    <Ionicons name="shield-checkmark" size={12} color={score >= 70 ? COLORS.success : COLORS.danger} />
                    <Text style={[styles.scoreBadgeText, { color: score >= 70 ? COLORS.success : COLORS.danger }]}>
                      Score: {score}/100
                    </Text>
                  </View>
                </View>

                <Text style={[styles.mainAmount, { color: esPositivo ? COLORS.success : COLORS.danger }]}>
                  {formatMoneda(balanceNeto)}
                </Text>

                <View style={styles.healthStatus}>
                  <Ionicons
                    name={esPositivo ? 'checkmark-circle' : 'warning'}
                    size={16}
                    color={esPositivo ? COLORS.success : COLORS.warning}
                  />
                  <Text style={[styles.healthText, { color: esPositivo ? COLORS.success : COLORS.warning }]}>
                    {esPositivo
                      ? `Has conservado el ${Math.round((balanceNeto / (totalIngresos || 1)) * 100)}% de tus ingresos este periodo.`
                      : 'Atención: tus gastos sobrepasaron el total de tus ingresos.'}
                  </Text>
                </View>
              </View>

              {/* Tarjetas Comparativas */}
              <View style={styles.rowCards}>
                <View style={[globalStyles.cardGlass, styles.miniCard]}>
                  <View style={styles.miniHeader}>
                    <View style={[styles.miniIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.18)' }]}>
                      <Ionicons name="arrow-up" size={16} color={COLORS.success} />
                    </View>
                    <Text style={styles.miniLabel}>Ingresos</Text>
                  </View>
                  <Text style={styles.miniAmountIngreso}>{formatMoneda(totalIngresos)}</Text>
                  <Text style={styles.miniSub}>{numIngresos} movimiento(s)</Text>
                </View>

                <View style={[globalStyles.cardGlass, styles.miniCard]}>
                  <View style={styles.miniHeader}>
                    <View style={[styles.miniIconBg, { backgroundColor: 'rgba(244, 63, 94, 0.18)' }]}>
                      <Ionicons name="arrow-down" size={16} color={COLORS.danger} />
                    </View>
                    <Text style={styles.miniLabel}>Gastos</Text>
                  </View>
                  <Text style={styles.miniAmountGasto}>-{formatMoneda(totalGastos)}</Text>
                  <Text style={styles.miniSub}>{numGastos} movimiento(s)</Text>
                </View>
              </View>

              {/* Barra Proporcional de Flujo */}
              <View style={[globalStyles.cardGlass, styles.progressCard]}>
                <Text style={styles.progressTitle}>Proporción de Flujo</Text>
                
                <View style={styles.barBackground}>
                  <View style={[styles.barIngresos, { width: `${pctIngresos}%` }]} />
                  <View style={[styles.barGastos, { width: `${pctGastos}%` }]} />
                </View>

                <View style={styles.progressLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.dotLegend, { backgroundColor: COLORS.success }]} />
                    <Text style={styles.legendText}>Ingresos ({pctIngresos}%)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.dotLegend, { backgroundColor: COLORS.danger }]} />
                    <Text style={styles.legendText}>Gastos ({pctGastos}%)</Text>
                  </View>
                </View>
              </View>

              {/* Gráfica por Categorías */}
              {estadisticasGastos.length > 0 && (
                <View style={[globalStyles.cardGlass, styles.chartCard]}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Categorías con Mayor Gasto</Text>
                    <Feather name="pie-chart" size={16} color={COLORS.primary} />
                  </View>

                  {estadisticasGastos.map((stat) => (
                    <View key={stat.categoria} style={styles.statRow}>
                      <View style={styles.statLabelRow}>
                        <Text style={styles.statCategoryText}>{stat.categoria}</Text>
                        <Text style={styles.statAmountText}>
                          ${stat.monto.toLocaleString('es-MX')} ({stat.porcentaje}%)
                        </Text>
                      </View>
                      <View style={styles.statTrack}>
                        <View style={[styles.statBar, { width: `${stat.porcentaje}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Botón de Exportación PDF */}
              <TouchableOpacity
                style={[
                  globalStyles.btnPrimary,
                  { marginTop: 16, backgroundColor: COLORS.primary },
                  exportandoPDF && { opacity: 0.7 }
                ]}
                onPress={handleExportarPDF}
                disabled={exportandoPDF}
                activeOpacity={0.88}
              >
                {exportandoPDF ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="file-text" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={[globalStyles.btnPrimaryText, { color: '#ffffff' }]}>EXPORTAR REPORTE A PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </BackgroundAnimated>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  mainCard: { borderRadius: 24, padding: 22, marginBottom: 16, backgroundColor: '#151e32' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  scoreBadgeText: { fontSize: 11, fontWeight: '800', marginLeft: 4 },
  mainAmount: { fontSize: 38, fontWeight: '900', marginVertical: 8, letterSpacing: -1 },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: COLORS.inputBg,
    padding: 12,
    borderRadius: 12,
  },
  healthText: { fontSize: 12, fontWeight: '600', marginLeft: 8, flex: 1 },
  rowCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  miniCard: { flex: 0.48, borderRadius: 20, padding: 16, backgroundColor: '#151e32' },
  miniHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  miniIconBg: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  miniLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  miniAmountIngreso: { color: COLORS.success, fontSize: 18, fontWeight: '900' },
  miniAmountGasto: { color: COLORS.danger, fontSize: 18, fontWeight: '900' },
  miniSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  progressCard: { borderRadius: 20, padding: 20, marginBottom: 16, backgroundColor: '#151e32' },
  progressTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', marginBottom: 14 },
  barBackground: { height: 12, backgroundColor: COLORS.inputBg, borderRadius: 6, flexDirection: 'row', overflow: 'hidden' },
  barIngresos: { backgroundColor: COLORS.success, height: '100%' },
  barGastos: { backgroundColor: COLORS.danger, height: '100%' },
  progressLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dotLegend: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },

  chartCard: { padding: 18, borderRadius: 20, backgroundColor: '#151e32' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  chartTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800' },
  statRow: { marginBottom: 12 },
  statLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statCategoryText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  statAmountText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '800' },
  statTrack: { height: 8, backgroundColor: COLORS.inputBg, borderRadius: 4, overflow: 'hidden' },
  statBar: { height: '100%', backgroundColor: COLORS.danger, borderRadius: 4 },

  centerContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
});