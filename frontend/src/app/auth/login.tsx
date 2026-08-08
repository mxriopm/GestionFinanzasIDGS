import React, { useState, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView,
  Animated,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Link } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import BackgroundAnimated from '../../components/BackgroundAnimated';
import { COLORS, globalStyles } from '../../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useContext(AuthContext);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const triggerAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.96, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ])
    ]).start();
  };

  const handleLogin = async () => {
    const correoLimpio = email.trim();
    const passLimpia = password.trim();

    if (!correoLimpio || !passLimpia) {
      const msg = 'Por favor llena todos los campos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atención', msg);
      return;
    }

    if (!EMAIL_REGEX.test(correoLimpio)) {
      const msg = 'Por favor ingresa un correo electrónico válido';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atención', msg);
      return;
    }

    try {
      setLoading(true);
      triggerAnimation();

      const res = await api.post('/auth/login', { 
        correo: correoLimpio, 
        password: passLimpia
      });

      if (res.data && res.data.token) {
        setSuccess(true);
        setTimeout(async () => {
          await login(res.data.token);
        }, 600);
      } else {
        const errorMsg = 'No se recibió un token válido';
        Platform.OS === 'web' ? alert(errorMsg) : Alert.alert('Error', errorMsg);
        fadeAnim.setValue(1);
      }
    } catch (error: any) {
      fadeAnim.setValue(1);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error al iniciar sesión';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error de Autenticación', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundAnimated>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.header}>
              <Text style={globalStyles.titleModern}>¡Bienvenido!</Text>
              <Text style={styles.subtitle}>Inicia sesión para gestionar tus finanzas</Text>
            </View>

            <View style={globalStyles.cardGlass}>
              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Correo Electrónico</Text>
                <TextInput
                  placeholder="tu@correo.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={globalStyles.inputGlass}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={globalStyles.label}>Contraseña</Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={globalStyles.inputGlass}
                />
              </View>

              <TouchableOpacity 
                style={[
                  globalStyles.btnPrimary, 
                  loading && { opacity: 0.8 },
                  success && { backgroundColor: COLORS.success }
                ]} 
                onPress={handleLogin}
                disabled={loading || success}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#090d16" />
                ) : success ? (
                  <Text style={globalStyles.btnPrimaryText}>✓ ¡Sesión Iniciada!</Text>
                ) : (
                  <Text style={globalStyles.btnPrimaryText}>INICIAR SESIÓN</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
              <Link href="/auth/registro" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Regístrate aquí</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundAnimated>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 28 },
  header: { marginBottom: 24 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  inputGroup: { marginBottom: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});