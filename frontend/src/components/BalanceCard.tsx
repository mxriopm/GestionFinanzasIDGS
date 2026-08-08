import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, globalStyles } from '../constants/theme';

interface BalanceCardProps {
  label: string;
  amount: number;
  amountColor?: string;
  countText: string;
  syncText?: string;
  icon?: React.ReactNode;
}

export default function BalanceCard({
  label,
  amount,
  amountColor = COLORS.danger,
  countText,
  syncText = 'Sincronizado',
  icon,
}: BalanceCardProps) {
  const formatMoneda = (cant: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cant || 0);

  return (
    <View style={[globalStyles.card, styles.balanceCard]}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>{label}</Text>
        {icon}
      </View>

      <Text style={[styles.balanceAmount, { color: amountColor }]}>{formatMoneda(amount)}</Text>

      <View style={styles.balanceFooter}>
        <View style={styles.badgeCount}>
          <Feather name="list" size={12} color={COLORS.success} />
          <Text style={styles.badgeCountText}>{countText}</Text>
        </View>
        <Text style={styles.syncText}>{syncText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: { marginHorizontal: 20, marginTop: 12, borderRadius: 24, padding: 22 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  balanceAmount: { fontSize: 36, fontWeight: '900', marginVertical: 8, letterSpacing: -0.5 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  badgeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeCountText: { color: COLORS.success, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  syncText: { color: COLORS.textDisabled, fontSize: 11 },
});