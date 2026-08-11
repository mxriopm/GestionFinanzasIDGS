import { StyleSheet } from 'react-native';

export type ThemeColors = {
  background: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  primary: string;
  success: string;
  danger: string;
  warning: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
};

export const COLORS: ThemeColors = {
  // Fondos Sólidos Elegantes
  background: '#0b1120',         // Dark Slate profundo
  cardBg: '#151e32',             // Azul noche sólido para cero transparencias feas
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  inputBg: '#0f172a',
  inputBorder: '#334155',

  // Acentos Limpios
  primary: '#0ea5e9',      // Sky Cyan (Súper legible)
  success: '#10b981',      // Esmeralda (Ingresos)
  danger: '#f43f5e',       // Rosa/Rojo (Gastos)
  warning: '#f59e0b',      // Ámbar (Advertencias)
  accent: '#6366f1',       // Indigo tenue

  // Tipografía de Alto Contraste
  textPrimary: '#ffffff',    // Blanco puro para títulos y montos
  textSecondary: '#cbd5e1',  // Gris muy claro para subtítulos
  textMuted: '#94a3b8',      // Gris medio para detalles
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cardGlass: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  titleModern: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputGlass: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});