import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import api from '../../services/api';
import BackgroundAnimated from '../../components/BackgroundAnimated';
import { COLORS, globalStyles } from '../../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    animateButton();

    const nombreLimpio = nombre.trim();
    const correoLimpio = email.trim();
    const passLimpia = password.trim();

    if (!nombreLimpio || !correoLimpio || !passLimpia) {
      const msg = 'Por favor llena todos los campos obligatorios';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atención', msg);
      return;
    }

    if (!EMAIL_REGEX.test(correoLimpio)) {
      const msg = 'Ingresa un formato de correo válido (ej. usuario@dominio.com)';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Correo Inválido', msg);
      return;
    }

    if (passLimpia.length < 6) {
      const msg = 'La contraseña debe tener un mínimo de 6 caracteres';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Contraseña Inválida', msg);
      return;
    }

    if (confirmPassword.trim() && passLimpia !== confirmPassword.trim()) {
      const msg = 'Las contraseñas no coinciden';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nombre: nombreLimpio,
        correo: correoLimpio,
        email: correoLimpio,
        password: passLimpia,
      };

      try {
        await api.post('/auth/registro', payload);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.post('/auth/register', payload);
        } else {
          throw err;
        }
      }

      setIsSuccess(true);

      setTimeout(() => {
        const msg = 'Cuenta creada correctamente. Procede a iniciar sesión.';
        if (Platform.OS === 'web') {
          alert(msg);
          router.replace('/auth/login');
        } else {
          Alert.alert('¡Registro Exitoso!', msg, [
            { text: 'Ir al Login', onPress: () => router.replace('/auth/login') },
          ]);
        }
      }, 500);

    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Error al crear la cuenta';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error de Registro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundAnimated>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cabecera con diseño e icono */}
            <View style={styles.headerContainer}>
              <View style={styles.logoBadge}>
                <Ionicons name="person-add-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>Únete para gestionar tus finanzas en tiempo real</Text>
            </View>

            {/* Formulario Glassmorphism */}
            <View style={[globalStyles.cardGlass, styles.formCard]}>
              {/* Campo Nombre */}
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Nombre Completo</Text>
                <View style={styles.inputWithIcon}>
                  <Feather name="user" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Ej. Juan Pablo"
                    placeholderTextColor={COLORS.textMuted}
                    value={nombre}
                    onChangeText={setNombre}
                    style={styles.textInput}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Campo Email */}
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Correo Electrónico</Text>
                <View style={styles.inputWithIcon}>
                  <Feather name="mail" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Campo Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Contraseña</Text>
                <View style={styles.inputWithIcon}>
                  <Feather name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmar Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Confirmar Contraseña</Text>
                <View style={styles.inputWithIcon}>
                  <Feather name="check-circle" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Botón Principal Animado */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 10 }}>
                <TouchableOpacity
                  style={[
                    globalStyles.btnPrimary,
                    loading && { opacity: 0.7 },
                    isSuccess && { backgroundColor: COLORS.success },
                  ]}
                  onPress={handleRegister}
                  disabled={loading || isSuccess}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#090d16" />
                  ) : isSuccess ? (
                    <Text style={[globalStyles.btnPrimaryText, { color: '#ffffff' }]}>
                      ✓ ¡Registrado!
                    </Text>
                  ) : (
                    <View style={styles.btnRow}>
                      <Text style={globalStyles.btnPrimaryText}>REGISTRARSE</Text>
                      <Feather name="arrow-right" size={18} color="#090d16" style={{ marginLeft: 6 }} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Inicia Sesión</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundAnimated>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});