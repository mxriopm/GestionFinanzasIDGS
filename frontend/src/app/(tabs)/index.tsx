import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardScreen() {
  const { logout } = useContext(AuthContext);

  const balanceTotal = 24850.00;
  const ingresosMes = 32000.00;
  const gastosMes = 7150.00;

  const transaccionesRecientes = [
    { id: '1', titulo: 'Pago de Nómina', tipo: 'ingreso', monto: 15000, fecha: 'Hoy' },
    { id: '2', titulo: 'Supermercado', tipo: 'gasto', monto: 1850, fecha: 'Ayer' },
    { id: '3', titulo: 'Suscripción Netflix', tipo: 'gasto', monto: 299, fecha: '22 Jul' },
    { id: '4', titulo: 'Proyecto Freelance', tipo: 'ingreso', monto: 5000, fecha: '20 Jul' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola de nuevo 👋</Text>
            <Text style={styles.userName}>Panel Financiero</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBadge}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>BALANCE TOTAL</Text>
          <Text style={styles.balanceAmount}>
            ${balanceTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </Text>
          
          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={{ fontSize: 16 }}>↓</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Ingresos</Text>
                <Text style={[styles.statAmount, { color: '#34d399' }]}>
                  +${ingresosMes.toLocaleString('es-MX')}
                </Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Text style={{ fontSize: 16 }}>↑</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Gastos</Text>
                <Text style={[styles.statAmount, { color: '#f87171' }]}>
                  -${gastosMes.toLocaleString('es-MX')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
        </View>

        <View style={styles.transactionsList}>
          {transaccionesRecientes.map((item) => (
            <View key={item.id} style={styles.transactionCard}>
              <View style={styles.txLeft}>
                <View style={[
                  styles.txIcon, 
                  { backgroundColor: item.tipo === 'ingreso' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
                ]}>
                  <Text style={{ fontSize: 18 }}>
                    {item.tipo === 'ingreso' ? '💰' : '🛒'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.txTitle}>{item.titulo}</Text>
                  <Text style={styles.txDate}>{item.fecha}</Text>
                </View>
              </View>
              <Text style={[
                styles.txAmount,
                { color: item.tipo === 'ingreso' ? '#34d399' : '#f87171' }
              ]}>
                {item.tipo === 'ingreso' ? '+' : '-'}${item.monto.toLocaleString('es-MX')}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  logoutBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 28,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
  },
  txDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});